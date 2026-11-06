import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_START_TICK,
  bgAt,
  dashboardAt,
  glucoseBand,
  iobAt,
  trendPointerDegrees,
} from "./simulated-glucose";

const TICKS = Array.from({ length: 288 * 3 }, (_, index) => index);

test("bgAt gives the same values on every run", () => {
  assert.deepEqual(TICKS.map(bgAt), TICKS.map(bgAt));
});

test("bgAt matches known samples, so the curve can't drift unnoticed", () => {
  assert.equal(bgAt(440), 168);
  assert.equal(bgAt(DEMO_START_TICK), 178);
  assert.equal(bgAt(446), 183);
});

test("bgAt returns whole numbers in a plausible range", () => {
  const values = TICKS.map(bgAt);
  for (const value of values) {
    assert.ok(Number.isInteger(value));
    assert.ok(value >= 40 && value <= 300, `${value} is out of range`);
  }
  assert.ok(Math.max(...values) > 180, "the day should include highs");
  assert.ok(Math.min(...values) < 70, "the day should include lows");
});

test("glucoseBand follows the range edges", () => {
  const cases = [
    [54, "urgent"],
    [55, "high-low"],
    [69, "high-low"],
    [70, "in-range"],
    [180, "in-range"],
    [181, "high-low"],
    [250, "high-low"],
    [251, "urgent"],
  ] as const;
  for (const [glucose, band] of cases) {
    assert.equal(glucoseBand(glucose), band);
  }
});

test("trendPointerDegrees stays in bounds and points up while rising", () => {
  for (const tick of TICKS) {
    assert.ok(Math.abs(trendPointerDegrees(tick)) <= 60);
  }
  // 171 to 178 across the trend window.
  assert.equal(trendPointerDegrees(DEMO_START_TICK), -17.5);
});

test("iobAt stays in a sensible range and wraps at midnight", () => {
  for (const tick of TICKS) {
    const iob = iobAt(tick);
    assert.ok(iob >= 0.4 && iob < 10, `${iob} is out of range`);
  }
  assert.equal(iobAt(-1), iobAt(287));
});

test("dashboardAt is repeatable and carries no carb figures", () => {
  const snapshot = dashboardAt(DEMO_START_TICK);
  assert.deepEqual(snapshot, dashboardAt(DEMO_START_TICK));
  assert.equal(snapshot.band, "in-range");
  assert.equal(snapshot.reservoirUnits, 129);
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "band",
    "glucose",
    "iobUnits",
    "pointerDegrees",
    "reservoirUnits",
  ]);
});
