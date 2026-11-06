import assert from "node:assert/strict";
import { mock, test } from "node:test";
import {
  DEFAULT_RANGE,
  LEAD_SAMPLES,
  createStepTimer,
  cycleRange,
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

test("stepping forward goes through 3, 6, 12 and 24, and stops", () => {
  const seen: RangeHours[] = [];
  let hours: RangeHours = 3;
  for (let step = 0; step < 5; step++) {
    seen.push(hours);
    hours = stepRange(hours, 1);
  }
  assert.deepEqual(seen, [3, 6, 12, 24, 24]);
});

test("stepping back stops at the shortest range", () => {
  assert.equal(stepRange(24, -1), 12);
  assert.equal(stepRange(6, -1), 3);
  assert.equal(stepRange(3, -1), 3);
});

test("the label cycles forward and goes round", () => {
  assert.deepEqual([3, 6, 12, 24].map((hours) => cycleRange(hours as RangeHours)), [
    6, 12, 24, 3,
  ]);
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

function fakeTimer() {
  mock.timers.enable({ apis: ["setTimeout"] });
  let nowMs = 0;
  let steps = 0;
  const timer = createStepTimer(
    3000,
    () => (steps += 1),
    () => nowMs,
  );
  return {
    timer,
    steps: () => steps,
    advance(ms: number) {
      nowMs += ms;
      mock.timers.tick(ms);
    },
  };
}

test("the step timer waits for both running and started", (t) => {
  t.after(() => mock.timers.reset());
  const { timer, steps, advance } = fakeTimer();
  timer.setRunning(true);
  advance(9000);
  assert.equal(steps(), 0);
  timer.start();
  advance(2999);
  assert.equal(steps(), 0);
  advance(1);
  assert.equal(steps(), 1);
  advance(3000);
  advance(3000);
  assert.equal(steps(), 3);
  timer.stop();
});

test("a stopped timer doesn't step, and returns with no burst", (t) => {
  t.after(() => mock.timers.reset());
  const { timer, steps, advance } = fakeTimer();
  timer.start();
  timer.setRunning(true);
  advance(2000);
  timer.setRunning(false);
  advance(60000);
  assert.equal(steps(), 0);
  timer.setRunning(true);
  advance(999);
  assert.equal(steps(), 0);
  advance(1);
  assert.equal(steps(), 1);
  timer.stop();
});
