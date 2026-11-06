import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_RANGE,
  LEAD_SAMPLES,
  rangeLabel,
  rangeSamples,
  stepRange,
  trendPhase,
} from "./dashboard-range";
import type { RangeHours } from "./dashboard-range";
import { DEMO_START_TICK, dashboardAt, trendAt } from "./simulated-glucose";

test("the chart opens on the last 24 hours", () => {
  assert.equal(DEFAULT_RANGE, 24);
  assert.equal(rangeLabel(DEFAULT_RANGE), "Last 24 hours");
  assert.equal(rangeSamples(DEFAULT_RANGE), 288);
});

test("stepping forward goes through 3, 6, 12 and 24, then round", () => {
  const seen: RangeHours[] = [];
  let hours: RangeHours = 3;
  for (let step = 0; step < 5; step++) {
    seen.push(hours);
    hours = stepRange(hours, 1);
  }
  assert.deepEqual(seen, [3, 6, 12, 24, 3]);
});

test("stepping back undoes stepping forward", () => {
  assert.equal(stepRange(3, -1), 24);
  for (const hours of [3, 6, 12, 24] as const) {
    assert.equal(stepRange(stepRange(hours, 1), -1), hours);
  }
});

test("the lanes redraw once every lead of samples, and hold in between", () => {
  const start = DEMO_START_TICK;
  assert.deepEqual(trendPhase(start, start), { baseTick: start, slide: 0 });
  assert.deepEqual(trendPhase(start + LEAD_SAMPLES - 1, start), {
    baseTick: start,
    slide: LEAD_SAMPLES - 1,
  });
  assert.deepEqual(trendPhase(start + LEAD_SAMPLES, start), {
    baseTick: start + LEAD_SAMPLES,
    slide: 0,
  });
});

test("the sample at the chart's right edge always matches the cards", () => {
  for (const hours of [3, 6, 12, 24] as const) {
    const window = rangeSamples(hours);
    for (let tick = DEMO_START_TICK; tick < DEMO_START_TICK + 300; tick++) {
      const { baseTick, slide } = trendPhase(tick, DEMO_START_TICK);
      const drawn = trendAt(
        baseTick + LEAD_SAMPLES - 1,
        window + LEAD_SAMPLES - 1,
      ).samples;
      const edge = drawn[window - 1 + slide];
      const card = dashboardAt(tick);
      assert.equal(edge.tick, tick);
      assert.equal(edge.glucose, card.glucose);
      assert.equal(edge.iobUnits, card.iobUnits);
      assert.equal(edge.basalUnitsPerHour, card.basalUnitsPerHour);
    }
  }
});
