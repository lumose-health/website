"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/v2/motion-provider";
import { loopScheduler } from "./loop-scheduler";
import type { FrameCallback } from "./loop-scheduler";

type UseLoopRegionOptions = {
  /** Per-frame work. Write to refs or attributes here, never React state. */
  onFrame?: FrameCallback;
  /** Puts JS-written values at their end state when reduced motion turns on. */
  onSettle?: () => void;
};

// Spreads onto the region's element. `data-lm-loop` is in the static HTML, as
// "frozen", so CSS loops stay still until the region is known to be onscreen,
// and with JS off they never start. React doesn't touch the attribute after
// hydration because this value never changes.
export function useLoopRegion<T extends Element = HTMLDivElement>(
  options: UseLoopRegionOptions = {},
) {
  const ref = useRef<T | null>(null);
  const { reduced } = useMotion();
  const hasFrames = options.onFrame !== undefined;

  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const region = loopScheduler.add({
      onFrame: hasFrames
        ? (elapsedMs, deltaMs) => latest.current.onFrame?.(elapsedMs, deltaMs)
        : undefined,
      onChange: (running) => {
        element.setAttribute("data-lm-loop", running ? "running" : "frozen");
      },
    });

    const observer = new IntersectionObserver(
      (records) => {
        region.setVisible(records[records.length - 1].isIntersecting);
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      region.remove();
      element.setAttribute("data-lm-loop", "frozen");
    };
  }, [hasFrames]);

  useEffect(() => {
    if (reduced) latest.current.onSettle?.();
  }, [reduced]);

  return { ref, "data-lm-loop": "frozen" } as const;
}
