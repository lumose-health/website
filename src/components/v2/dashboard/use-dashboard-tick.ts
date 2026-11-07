"use client";

import { useCallback, useEffect, useState } from "react";
import { TICK_MS, createStepTimer } from "@/lib/v2/dashboard-range";
import { DEMO_START_TICK } from "@/lib/v2/simulated-glucose";
import { useLoopRegion } from "@/lib/v2/use-loop-region";

// Matches the delay on the starting states in globals.css.
const FAIL_OPEN_MS = 3000;

/**
 * Steps the dashboard one sample at a time once the lanes are drawn. It's a timer,
 * not a frame loop, and follows the region's state, which is off while offscreen,
 * hidden, paused or under reduced motion.
 */
export function useDashboardTick() {
  const [tick, setTick] = useState(DEMO_START_TICK);
  const [timer] = useState(() =>
    createStepTimer(TICK_MS, () => setTick((current) => current + 1)),
  );

  const region = useLoopRegion<HTMLElement>({
    onRunningChange: timer.setRunning,
  });

  useEffect(() => timer.stop, [timer]);

  return { tick, region, start: timer.start };
}

/**
 * Sets `data-lm-shown` once, the first time the element is in view, which starts
 * its CSS entrance. Static HTML has no attribute, and the hidden starting state
 * applies only when scripting is on and motion is allowed. `data-lm-hydrated`
 * cancels the CSS fail-open. If hydration is too late for that, the element is
 * already open, so its entrance is skipped.
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
      const show = (delayMs: number) => {
        element.setAttribute("data-lm-shown", "");
        if (onDone) timer = setTimeout(onDone, delayMs);
      };

      element.setAttribute("data-lm-hydrated", "");
      if (performance.now() >= FAIL_OPEN_MS) {
        show(0);
        return () => clearTimeout(timer);
      }

      const observer = new IntersectionObserver(
        (records) => {
          // The first report arrives whatever the ratio, so check it here too.
          const reached = records.some(
            (record) =>
              record.isIntersecting && record.intersectionRatio >= threshold,
          );
          if (!reached) return;
          observer.disconnect();
          show(afterMs);
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
