// One requestAnimationFrame loop shared by every animated region. It holds no
// DOM or React state, and it stops entirely when no region needs a frame.

// A longer gap, from a blocked main thread for example, counts as this much, so
// a loop never jumps ahead to catch up.
const MAX_FRAME_MS = 100;

export type FrameCallback = (elapsedMs: number, deltaMs: number) => void;

export type LoopRegionOptions = {
  /** Left out for regions animated by CSS, which need no frames. */
  onFrame?: FrameCallback;
  /** Called when the region starts or stops running. */
  onChange?: (running: boolean) => void;
};

export type LoopRegion = {
  setVisible(visible: boolean): void;
  remove(): void;
};

export type FrameDriver = {
  request(callback: (now: number) => void): number;
  cancel(id: number): void;
  /** Receives anything a region's onFrame throws. */
  report(error: unknown): void;
};

type Entry = LoopRegionOptions & {
  visible: boolean;
  running: boolean;
  elapsedMs: number;
  lastFrameAt: number | null;
};

export function createLoopScheduler(driver: FrameDriver) {
  const entries = new Set<Entry>();
  let paused = false;
  let pendingFrame: number | null = null;

  function needsFrames() {
    for (const entry of entries) {
      if (entry.running && entry.onFrame) return true;
    }
    return false;
  }

  function syncFrame() {
    const needed = needsFrames();
    if (needed && pendingFrame === null) {
      pendingFrame = driver.request(onAnimationFrame);
    } else if (!needed && pendingFrame !== null) {
      driver.cancel(pendingFrame);
      pendingFrame = null;
    }
  }

  function onAnimationFrame(now: number) {
    pendingFrame = null;
    try {
      for (const entry of entries) {
        if (!entry.running || !entry.onFrame) continue;
        // A region's first frame after starting advances nothing, so time spent
        // frozen is never added to its phase.
        const deltaMs =
          entry.lastFrameAt === null
            ? 0
            : Math.min(now - entry.lastFrameAt, MAX_FRAME_MS);
        entry.lastFrameAt = now;
        entry.elapsedMs += deltaMs;
        try {
          entry.onFrame(entry.elapsedMs, deltaMs);
        } catch (error) {
          // One broken region must not take the others' frames with it, and
          // reports once. Its CSS loops and lifecycle carry on without frames.
          // Dropped first, so a failing report can't leave it running.
          entry.onFrame = undefined;
          driver.report(error);
        }
      }
    } finally {
      syncFrame();
    }
  }

  function updateEntry(entry: Entry) {
    const running = entry.visible && !paused;
    if (running === entry.running) return;
    entry.running = running;
    entry.lastFrameAt = null;
    entry.onChange?.(running);
  }

  function setPaused(next: boolean) {
    paused = next;
    entries.forEach(updateEntry);
    syncFrame();
  }

  return {
    /** Regions start hidden. They run once setVisible(true) is called. */
    add(options: LoopRegionOptions): LoopRegion {
      const entry: Entry = {
        ...options,
        visible: false,
        running: false,
        elapsedMs: 0,
        lastFrameAt: null,
      };
      entries.add(entry);
      return {
        setVisible(visible) {
          entry.visible = visible;
          updateEntry(entry);
          syncFrame();
        },
        remove() {
          entries.delete(entry);
          syncFrame();
        },
      };
    },
    /** Freezes every region, keeping each one's phase. */
    pause() {
      setPaused(true);
    },
    resume() {
      setPaused(false);
    },
    isFramePending() {
      return pendingFrame !== null;
    },
  };
}

export type LoopScheduler = ReturnType<typeof createLoopScheduler>;

export const loopScheduler = createLoopScheduler({
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
  report: (error) => reportError(error),
});

/** Calls back with whether the element is onscreen. Returns a stop function. */
export type VisibilityWatcher = (
  element: Element,
  onChange: (visible: boolean) => void,
) => () => void;

// Regions count as offscreen more than 100px outside the viewport.
const watchViewport: VisibilityWatcher = (element, onChange) => {
  const observer = new IntersectionObserver(
    (records) => onChange(records[records.length - 1].isIntersecting),
    { rootMargin: "100px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
};

/**
 * Runs a region on one element until the returned function is called. Each
 * element gets its own attachment, so a replaced element can't leave the
 * observer watching the old node.
 */
export function attachLoopRegion(
  element: Element,
  onFrame: FrameCallback | undefined,
  scheduler: LoopScheduler = loopScheduler,
  watch: VisibilityWatcher = watchViewport,
  onRunningChange?: (running: boolean) => void,
) {
  const region = scheduler.add({
    onFrame,
    onChange: (running) => {
      element.setAttribute("data-lm-loop", running ? "running" : "frozen");
      onRunningChange?.(running);
    },
  });
  const stopWatching = watch(element, region.setVisible);

  return () => {
    stopWatching();
    region.remove();
    element.setAttribute("data-lm-loop", "frozen");
    onRunningChange?.(false);
  };
}
