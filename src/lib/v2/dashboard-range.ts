// The dashboard chart's range steps and how it follows the tick. No DOM or React,
// so it can be tested on its own.

const RANGE_HOURS = [3, 6, 12, 24] as const;
const SAMPLES_PER_HOUR = 12;

export type RangeHours = (typeof RANGE_HOURS)[number];

export const DEFAULT_RANGE: RangeHours = 24;

/** One 5-minute sample lands this often. */
export const TICK_MS = 3000;

/**
 * Samples drawn ahead of the newest one. Each tick slides the drawn lanes along
 * by one sample, and React only redraws them when this many have been used up.
 */
export const LEAD_SAMPLES = 12;

/** The next range along, or the same one when it's already at that end. */
export function stepRange(hours: RangeHours, step: 1 | -1): RangeHours {
  return RANGE_HOURS[RANGE_HOURS.indexOf(hours) + step] ?? hours;
}

/** The label's behaviour: always forward, going round from the longest. */
export function cycleRange(hours: RangeHours): RangeHours {
  return stepRange(hours, 1) === hours ? RANGE_HOURS[0] : stepRange(hours, 1);
}

export function rangeLabel(hours: RangeHours) {
  return `Last ${hours} hours`;
}

export function rangeSamples(hours: RangeHours) {
  return hours * SAMPLES_PER_HOUR;
}

/** The sample the lanes were last drawn from, and how far they have slid since. */
export function trendPhase(tick: number, startTick: number) {
  const slide = (tick - startTick) % LEAD_SAMPLES;
  return { baseTick: tick - slide, slide };
}

/**
 * Fires every interval while both running and started, keeping what's left of the
 * current wait across a stop. There's only ever one timeout, so a long stop can't
 * build up steps to burst out on return.
 */
export function createStepTimer(
  intervalMs: number,
  onStep: () => void,
  now: () => number = () => performance.now(),
) {
  let running = false;
  let started = false;
  let remainingMs = intervalMs;
  let dueAt = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function disarm() {
    if (timeout === undefined) return;
    clearTimeout(timeout);
    timeout = undefined;
    remainingMs = Math.max(0, dueAt - now());
  }

  function arm() {
    if (!running || !started || timeout !== undefined) return;
    dueAt = now() + remainingMs;
    timeout = setTimeout(() => {
      timeout = undefined;
      remainingMs = intervalMs;
      onStep();
      arm();
    }, remainingMs);
  }

  return {
    /** Follows the loop region, which covers offscreen, hidden, paused and reduced. */
    setRunning(next: boolean) {
      running = next;
      if (next) arm();
      else disarm();
    },
    /** Opens the first wait. Nothing fires before this. */
    start() {
      started = true;
      arm();
    },
    stop: disarm,
  };
}
