// A label that steps through a list of names. No DOM or React, so it can be
// tested on its own.

/** How long each name stays up. */
export const LABEL_STEP_MS = 2800;

/** The next name's index, wrapping at the end of the list. */
export function nextLabelIndex(index: number, count: number) {
  return count > 0 ? (index + 1) % count : 0;
}

export type LabelSlot = "current" | "previous" | "waiting";

/**
 * Where a name sits while the label rolls: showing, just rolled out above, or
 * waiting below for its turn. With a single name there is nothing to roll out.
 */
export function labelSlot(
  position: number,
  index: number,
  count: number,
): LabelSlot {
  if (position === index) return "current";
  return nextLabelIndex(position, count) === index ? "previous" : "waiting";
}

export type RotationHold = "hover" | "focus";

/**
 * Decides when the rotation may run: only while its loop region is running and
 * nothing is holding it. Calls back only when the answer changes.
 */
export function createRotationGate(setRunning: (running: boolean) => void) {
  const holds = new Set<RotationHold>();
  let regionRunning = false;
  let running = false;

  function sync() {
    const next = regionRunning && holds.size === 0;
    if (next === running) return;
    running = next;
    setRunning(next);
  }

  return {
    /** Follows the loop region, which covers offscreen, hidden, paused and reduced. */
    setRegionRunning(next: boolean) {
      regionRunning = next;
      sync();
    },
    /** Keeps the current name up while the pointer or keyboard focus is on it. */
    setHold(hold: RotationHold, held: boolean) {
      if (held) holds.add(hold);
      else holds.delete(hold);
      sync();
    },
  };
}
