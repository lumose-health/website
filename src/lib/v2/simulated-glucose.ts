// Made-up numbers for the dashboard mockup. Pure functions of a sample index, so
// the server and the browser agree and any frame can be reproduced.

/** Samples in a day, at one every five minutes. */
const SAMPLES_PER_DAY = 288;

/** The sample the page opens on, early afternoon of the second simulated day. */
export const DEMO_START_TICK = SAMPLES_PER_DAY + 156;

const STARTING_RESERVOIR_UNITS = 140;
const SAMPLES_PER_RESERVOIR_UNIT = 40;

/** Samples back that the trend is measured over, which is fifteen minutes. */
const TREND_WINDOW = 3;
const POINTER_DEGREES_PER_MG_DL = 2.5;
const POINTER_MAX_DEGREES = 60;

const IOB_BASELINE_UNITS = 0.4;
const IOB_DOSES = [
  { sample: 100, units: 3.2 },
  { sample: 154, units: 2.6 },
  { sample: 232, units: 3.4 },
  { sample: 40, units: 0.8 },
  { sample: 200, units: 0.6 },
];
const IOB_DOSE_LIFETIME = 50;
const IOB_DECAY = 18;
const IOB_ONSET = 3;

export type GlucoseBand = "in-range" | "high-low" | "urgent";

function sampleOfDay(tick: number) {
  return ((tick % SAMPLES_PER_DAY) + SAMPLES_PER_DAY) % SAMPLES_PER_DAY;
}

/** Glucose in mg/dL for a sample, following a plausible day with three meals. */
export function bgAt(tick: number) {
  const hour = sampleOfDay(tick) / 12;
  const bump = (center: number, width: number) =>
    Math.exp(-(((hour - center) / width) ** 2));

  return Math.round(
    108 +
      14 * Math.sin(tick / 9) +
      6 * Math.sin(tick / 3.1) +
      70 * bump(8.6, 1) +
      88 * bump(13.1, 1.2) +
      98 * bump(19.6, 1.3) -
      44 * bump(3, 1.1),
  );
}

/** Insulin on board in units for a sample. */
export function iobAt(tick: number) {
  const sample = sampleOfDay(tick);
  const fromDose = (doseSample: number) => {
    const since = sampleOfDay(sample - doseSample);
    if (since >= IOB_DOSE_LIFETIME) return 0;
    const onset = since < IOB_ONSET ? since / IOB_ONSET : 1;
    return Math.exp(-since / IOB_DECAY) * onset;
  };

  return IOB_DOSES.reduce(
    (total, dose) => total + dose.units * fromDose(dose.sample),
    IOB_BASELINE_UNITS,
  );
}

/** Green from 70 to 180, amber outside that, red below 55 or above 250. */
export function glucoseBand(glucose: number): GlucoseBand {
  if (glucose < 55 || glucose > 250) return "urgent";
  if (glucose < 70 || glucose > 180) return "high-low";
  return "in-range";
}

/** Degrees to turn the pointer: 0 is level, negative points up, for rising. */
export function trendPointerDegrees(tick: number) {
  const change = bgAt(tick) - bgAt(tick - TREND_WINDOW);
  const degrees = -change * POINTER_DEGREES_PER_MG_DL;
  return Math.max(-POINTER_MAX_DEGREES, Math.min(POINTER_MAX_DEGREES, degrees));
}

/** Everything the live cards show for one sample. */
export function dashboardAt(tick: number) {
  const glucose = bgAt(tick);
  return {
    glucose,
    band: glucoseBand(glucose),
    pointerDegrees: trendPointerDegrees(tick),
    iobUnits: iobAt(tick),
    reservoirUnits:
      STARTING_RESERVOIR_UNITS - Math.floor(tick / SAMPLES_PER_RESERVOIR_UNIT),
  };
}

export type DashboardSnapshot = ReturnType<typeof dashboardAt>;
