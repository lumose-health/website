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
  timeLabelsAt,
  trendAt,
  trendPointerDegrees,
} from "./simulated-glucose";

const TICKS = Array.from({ length: 288 * 3 }, (_, index) => index);
// The page ticks for as long as it's watched, so the rules must hold well past
// the first few days. Sixty simulated days is eight hours of watching.
const LONG_VISIT = Array.from(
  { length: 288 * 60 },
  (_, index) => DEMO_START_TICK + index,
);

test("bgAt gives the same values on every run", () => {
  // A pinned digest, so anything random or clock-based fails against this file
  // rather than matching a second call made a moment later.
  const digest = createHash("sha256")
    .update(TICKS.map(bgAt).join(","))
    .digest("hex");
  assert.equal(
    digest,
    "a036b49c797bb2d1e65208f2f5ddf5860aca4806f2dc3de1c1c79fe81779c5f9",
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
    [1.1, -45],
    [1, 0],
    [0, 0],
    [-1, 0],
    [-1.1, 45],
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
  assert.equal(basalAt(29), 0.8);
  assert.equal(basalAt(30), 0.2);
  assert.equal(basalAt(44), 0.2);
  assert.equal(basalAt(45), 0.8);
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
  assert.equal(iobAt(91) - iobAt(90), 3.2);
});

test("iobAt tails off without a cliff", () => {
  for (const tick of TICKS) {
    const drop = iobAt(tick) - iobAt(tick + 1);
    assert.ok(drop < 0.15, `drops ${drop} at ${tick}`);
  }
});

test("meal boluses land in range, ahead of the peak", () => {
  for (const sample of [91, 145, 223]) {
    for (const day of [0, 1, 2]) {
      const tick = sample + day * 288;
      assert.ok(bgAt(tick) <= 180, `${bgAt(tick)} at ${tick}`);
      assert.ok(bgAt(tick) < bgAt(tick + 12), `no rise after ${tick}`);
    }
  }
});

test("the overnight low stays above the urgent line", () => {
  const values = TICKS.map(bgAt);
  assert.ok(Math.min(...values) >= 55, `${Math.min(...values)} is urgent`);
});

test("auto corrections only land on high glucose", () => {
  for (const sample of [160, 236]) {
    for (const day of [0, 1, 2]) {
      const glucose = bgAt(sample + day * 288);
      assert.ok(glucose > 180, `${glucose} at sample ${sample} on day ${day}`);
    }
  }
});

test("the time axis runs across the last 24 hours", () => {
  assert.deepEqual(timeLabelsAt(DEMO_START_TICK), [
    "1:00 PM",
    "7:00 PM",
    "1:00 AM",
    "7:00 AM",
    "1:00 PM",
  ]);
});

test("the time axis divides a shorter window evenly", () => {
  assert.deepEqual(timeLabelsAt(DEMO_START_TICK, 36), [
    "10:00 AM",
    "10:45 AM",
    "11:30 AM",
    "12:15 PM",
    "1:00 PM",
  ]);
});

test("trendAt can end a shorter window on any sample", () => {
  const { samples, doses } = trendAt(DEMO_START_TICK, 36);
  assert.equal(samples.length, 36);
  assert.equal(samples[0].position, 0);
  assert.equal(samples.at(-1)!.tick, DEMO_START_TICK);
  assert.equal(samples.at(-1)!.position, 1);
  assert.deepEqual(
    doses.map(({ tick, kind }) => [tick, kind]),
    [[288 + 145, "manual"]],
  );
});

test("glucose loops after five days with no visible join", () => {
  const loop = 288 * 5;
  assert.equal(bgAt(1000 + loop), bgAt(1000));
  assert.ok(Math.abs(bgAt(loop) - bgAt(loop - 1)) <= 3);
});

test("a long visit never shows an urgent value", () => {
  for (const tick of LONG_VISIT) {
    assert.notEqual(glucoseBand(bgAt(tick)), "urgent", `at ${tick}`);
  }
});

test("a long visit never corrects a low or runs the pump dry", () => {
  for (const tick of LONG_VISIT) {
    const { reservoirUnits } = dashboardAt(tick);
    assert.ok(reservoirUnits > 0, `${reservoirUnits}u at ${tick}`);
    for (const { kind } of trendAt(tick, 1).doses) {
      if (kind === "auto") assert.ok(bgAt(tick) > 180, `${bgAt(tick)} at ${tick}`);
    }
  }
});

test("each new dose shows up in IOB on the sample it lands", () => {
  for (const tick of LONG_VISIT) {
    for (const { units } of trendAt(tick, 1).doses) {
      assert.ok(iobAt(tick) - iobAt(tick - 1) > units - 0.15, `at ${tick}`);
    }
  }
});
