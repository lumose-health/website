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

/** Moves through the ranges, going round from either end. */
export function stepRange(hours: RangeHours, step: 1 | -1): RangeHours {
  const count = RANGE_HOURS.length;
  return RANGE_HOURS[(RANGE_HOURS.indexOf(hours) + step + count) % count];
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
