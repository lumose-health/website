"use client";

import { useEffect, useState } from "react";
import { createStepTimer } from "./dashboard-range";
import {
  LABEL_STEP_MS,
  createRotationGate,
  nextLabelIndex,
} from "./label-rotation";
import { useLoopRegion } from "./use-loop-region";

/**
 * Steps through `count` names on a timer that follows the loop region, so it
 * stops offscreen, in a hidden tab, while paused and under reduced motion, where
 * it goes back to the first. Spread `region` onto the element that should own
 * that state. `holdProps` keep the current name while it's hovered or focused.
 */
export function useLabelRotation<T extends Element = HTMLDivElement>(
  count: number,
) {
  const [index, setIndex] = useState(0);
  const [{ timer, gate }] = useState(() => {
    const stepTimer = createStepTimer(LABEL_STEP_MS, () =>
      setIndex((current) => nextLabelIndex(current, count)),
    );
    return { timer: stepTimer, gate: createRotationGate(stepTimer.setRunning) };
  });

  const region = useLoopRegion<T>({
    onRunningChange: gate.setRegionRunning,
    onSettle: () => setIndex(0),
  });

  useEffect(() => {
    timer.start();
    return timer.stop;
  }, [timer]);

  const holdProps = {
    onPointerEnter: () => gate.setHold("hover", true),
    onPointerLeave: () => gate.setHold("hover", false),
    onFocus: () => gate.setHold("focus", true),
    onBlur: () => gate.setHold("focus", false),
  };

  return { index, region, holdProps };
}
