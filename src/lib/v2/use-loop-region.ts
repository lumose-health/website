"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotion } from "@/components/v2/motion-provider";
import { attachLoopRegion } from "./loop-scheduler";
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
  const { reduced } = useMotion();
  const hasFrames = options.onFrame !== undefined;

  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  // A callback ref, so a region attaches whenever its element appears or is
  // replaced, even if that happens long after this hook first ran.
  const ref = useCallback(
    (element: T | null) => {
      if (!element) return;
      return attachLoopRegion(
        element,
        hasFrames
          ? (elapsedMs, deltaMs) => latest.current.onFrame?.(elapsedMs, deltaMs)
          : undefined,
      );
    },
    [hasFrames],
  );

  useEffect(() => {
    if (reduced) latest.current.onSettle?.();
  }, [reduced]);

  return { ref, "data-lm-loop": "frozen" } as const;
}
