"use client";

import { useCallback, useRef, useState } from "react";
import { TICK_MS } from "@/lib/v2/dashboard-range";
import { DEMO_START_TICK } from "@/lib/v2/simulated-glucose";
import { useLoopRegion } from "@/lib/v2/use-loop-region";

/**
 * Steps the dashboard one sample at a time once the lanes are drawn. It runs on
 * the shared loop, which skips it while offscreen, hidden, paused or under
 * reduced motion. That loop caps each frame's time, so nothing piles up to burst
 * out on resume, and the only state write is the one per tick.
 */
export function useDashboardTick() {
  const [tick, setTick] = useState(DEMO_START_TICK);
  const ready = useRef(false);
  const waitedMs = useRef(0);

  const region = useLoopRegion<HTMLElement>({
    onFrame(_elapsedMs, deltaMs) {
      if (!ready.current) return;
      waitedMs.current += deltaMs;
      if (waitedMs.current < TICK_MS) return;
      waitedMs.current -= TICK_MS;
      setTick((current) => current + 1);
    },
  });

  const start = useCallback(() => {
    ready.current = true;
  }, []);

  return { tick, region, start };
}

/**
 * Sets `data-lm-shown` once, the first time the element is in view, which starts
 * its CSS entrance. Static HTML has no attribute, and the hidden starting state
 * applies only when scripting is on and motion is allowed.
 */
export function useShownOnce<T extends Element = HTMLDivElement>(
  threshold: number,
  afterMs = 0,
  onDone?: () => void,
) {
  return useCallback(
    (element: T | null) => {
      if (!element) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const observer = new IntersectionObserver(
        (records) => {
          if (!records.some((record) => record.isIntersecting)) return;
          observer.disconnect();
          element.setAttribute("data-lm-shown", "");
          if (onDone) timer = setTimeout(onDone, afterMs);
        },
        { threshold },
      );
      observer.observe(element);
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    },
    [threshold, afterMs, onDone],
  );
}
