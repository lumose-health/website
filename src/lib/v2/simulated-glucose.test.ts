import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  DEMO_START_TICK,
  basalAt,
  bgAt,
  dashboardAt,
  formatSampleTime,
  glucoseBand,
  iobAt,
  pointerDegreesForRate,
  trendAt,
  trendPointerDegrees,
} from "./simulated-glucose";

const TICKS = Array.from({ length: 288 * 3 }, (_, index) => index);

test("bgAt gives the same values on every run", () => {
  // A pinned digest, so anything random or clock-based fails against this file
  // rather than matching a second call made a moment later.
  const digest = createHash("sha256")
    .update(TICKS.map(bgAt).join(","))
    .digest("hex");
  assert.equal(
    digest,
    "9a1c5d607424b4b37f456570ece8aeb4d0b6e34d2bb20d25d9ddd5828d938458",
  );
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

test("pointerDegreesForRate follows the real app's trend bands", () => {
  const cases = [
    [3.1, -90],
    [3, -45],
    [0.6, -45],
    [0.5, 0],
    [0, 0],
    [-0.5, 0],
    [-0.6, 45],
    [-3, 45],
    [-3.1, 90],
  ] as const;
  for (const [rate, degrees] of cases) {
    assert.equal(pointerDegreesForRate(rate), degrees);
  }
});

test("trendPointerDegrees only uses angles the real app draws", () => {
  const seen = new Set(TICKS.map(trendPointerDegrees));
  for (const degrees of seen) {
    assert.ok([0, 45, -45, 90, -90].includes(degrees), `${degrees} degrees`);
  }
  // 171 to 178 across the trend window is 0.47 mg/dL per minute, which is stable.
  assert.equal(trendPointerDegrees(DEMO_START_TICK), 0);
  assert.equal(trendPointerDegrees(228), -45);
  assert.equal(trendPointerDegrees(246), 45);
});

test("iobAt stays in a sensible range and wraps at midnight", () => {
  for (const tick of TICKS) {
    const iob = iobAt(tick);
    assert.ok(iob >= 0.4 && iob < 4.5, `${iob} is out of range`);
  }
  assert.equal(iobAt(-1), iobAt(287));
});

test("dashboardAt is repeatable and carries no carb figures", () => {
  const snapshot = dashboardAt(DEMO_START_TICK);
  assert.deepEqual(snapshot, dashboardAt(DEMO_START_TICK));
  assert.equal(snapshot.band, "in-range");
  assert.equal(snapshot.reservoirUnits, 129);
  assert.equal(snapshot.basalUnitsPerHour, 0.95);
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "band",
    "basalUnitsPerHour",
    "glucose",
    "iobUnits",
    "pointerDegrees",
    "reservoirUnits",
  ]);
});

test("basalAt steps through the day and wraps at midnight", () => {
  assert.equal(basalAt(0), 0.8);
  assert.equal(basalAt(47), 0.8);
  assert.equal(basalAt(48), 1.05);
  assert.equal(basalAt(287), 0.9);
  assert.equal(basalAt(-1), basalAt(287));
});

test("formatSampleTime writes a 12-hour clock", () => {
  assert.equal(formatSampleTime(0), "12:00 AM");
  assert.equal(formatSampleTime(1), "12:05 AM");
  assert.equal(formatSampleTime(144), "12:00 PM");
  assert.equal(formatSampleTime(DEMO_START_TICK), "1:00 PM");
});

test("the last sample of every lane matches the cards", () => {
  for (const tick of TICKS.map((index) => index + 288)) {
    const latest = trendAt(tick).samples.at(-1)!;
    const card = dashboardAt(tick);
    assert.equal(latest.position, 1);
    assert.equal(latest.glucose, card.glucose);
    assert.equal(latest.band, card.band);
    assert.equal(latest.iobUnits, card.iobUnits);
    assert.equal(latest.basalUnitsPerHour, card.basalUnitsPerHour);
  }
});

test("the doses lane shows the doses behind the IOB curve", () => {
  const { doses, samples } = trendAt(DEMO_START_TICK);
  assert.equal(samples.length, 288);
  assert.deepEqual(
    doses.map(({ units, kind }) => [units, kind]),
    [
      [0.6, "auto"],
      [3.4, "manual"],
      [0.8, "auto"],
      [3.2, "manual"],
      [2.6, "manual"],
    ],
  );
  // Three samples on, the onset ramp has finished and most of the dose shows.
  assert.ok(iobAt(103) - iobAt(99) > 0.8 * 3.2);
});

test("auto corrections only land on high glucose", () => {
  for (const sample of [160, 242]) {
    for (const day of [0, 1, 2]) {
      const glucose = bgAt(sample + day * 288);
      assert.ok(glucose > 170, `${glucose} at sample ${sample} on day ${day}`);
    }
  }
});

test("the time axis runs across the last 24 hours", () => {
  const { timeLabels } = trendAt(DEMO_START_TICK);
  assert.equal(timeLabels.length, 5);
  assert.equal(timeLabels[0], "1:05 PM");
  assert.equal(timeLabels[4], "1:00 PM");
});
