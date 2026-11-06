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
const MINUTES_PER_SAMPLE = 5;
/** The real app's stable and fast bands, in mg/dL per minute. */
const STABLE_RATE = 1;
const FAST_RATE = 3;

const IOB_BASELINE_UNITS = 0.4;
/** Each dose feeds both the doses lane and the IOB curve, so the two can't differ. */
const DOSES: readonly Dose[] = [
  { sample: 91, units: 3.2, kind: "manual" },
  { sample: 145, units: 2.6, kind: "manual" },
  { sample: 223, units: 3.4, kind: "manual" },
  { sample: 160, units: 0.6, kind: "auto" },
  { sample: 236, units: 0.8, kind: "auto" },
];
const IOB_DOSE_LIFETIME = 60;

/** Pump rates through the day, in u/hr. The last step runs to midnight. */
const BASAL_SCHEDULE = [
  { fromHour: 0, rate: 0.8 },
  { fromHour: 2.5, rate: 0.2 },
  { fromHour: 3.75, rate: 0.8 },
  { fromHour: 4, rate: 1.05 },
  { fromHour: 8, rate: 0.85 },
  { fromHour: 12, rate: 0.95 },
  { fromHour: 17, rate: 1 },
  { fromHour: 21, rate: 0.9 },
];

const TIME_AXIS_LABELS = 5;
/** Six hours between axis labels. */
const SAMPLES_PER_TIME_LABEL = 72;

export type GlucoseBand = "in-range" | "high-low" | "urgent";
export type DoseKind = "manual" | "auto";
type Dose = { sample: number; units: number; kind: DoseKind };

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
      24 * bump(3, 1.1),
  );
}

/** Insulin on board in units for a sample. */
export function iobAt(tick: number) {
  const sample = sampleOfDay(tick);
  const fromDose = (doseSample: number) => {
    const since = sampleOfDay(sample - doseSample);
    if (since >= IOB_DOSE_LIFETIME) return 0;
    return (1 - (since / IOB_DOSE_LIFETIME) ** 2) ** 2;
  };

  return DOSES.reduce(
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

/** Basal rate in u/hr for a sample. */
export function basalAt(tick: number) {
  const hour = sampleOfDay(tick) / 12;
  return BASAL_SCHEDULE.findLast((step) => hour >= step.fromHour)!.rate;
}

/** The angle the real app draws for a rate: 0 is level, negative points up. */
export function pointerDegreesForRate(mgDlPerMinute: number) {
  const speed = Math.abs(mgDlPerMinute);
  if (speed <= STABLE_RATE) return 0;
  const degrees = speed > FAST_RATE ? 90 : 45;
  return mgDlPerMinute > 0 ? -degrees : degrees;
}

/** Degrees to turn the pointer for the trend at a sample. */
export function trendPointerDegrees(tick: number) {
  const change = bgAt(tick) - bgAt(tick - TREND_WINDOW);
  return pointerDegreesForRate(change / (TREND_WINDOW * MINUTES_PER_SAMPLE));
}

/** Clock time for a sample, as the real app's time axis writes it. */
export function formatSampleTime(tick: number) {
  const minutes = sampleOfDay(tick) * MINUTES_PER_SAMPLE;
  const hours = Math.floor(minutes / 60);
  const period = hours < 12 ? "AM" : "PM";
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hours % 12 || 12}:${minute} ${period}`;
}

/** Everything the live cards show for one sample. */
export function dashboardAt(tick: number) {
  const glucose = bgAt(tick);
  return {
    glucose,
    band: glucoseBand(glucose),
    pointerDegrees: trendPointerDegrees(tick),
    iobUnits: iobAt(tick),
    basalUnitsPerHour: basalAt(tick),
    reservoirUnits:
      STARTING_RESERVOIR_UNITS - Math.floor(tick / SAMPLES_PER_RESERVOIR_UNIT),
  };
}

export type DashboardSnapshot = ReturnType<typeof dashboardAt>;

/** The lanes for the 24 hours ending at a sample. Positions run from 0 to 1. */
export function trendAt(tick: number) {
  const ticks = Array.from(
    { length: SAMPLES_PER_DAY },
    (_, index) => tick - SAMPLES_PER_DAY + 1 + index,
  );
  const positionOf = (index: number) => index / (SAMPLES_PER_DAY - 1);

  return {
    samples: ticks.map((sampleTick, index) => {
      const glucose = bgAt(sampleTick);
      return {
        position: positionOf(index),
        glucose,
        band: glucoseBand(glucose),
        iobUnits: iobAt(sampleTick),
        basalUnitsPerHour: basalAt(sampleTick),
      };
    }),
    doses: ticks.flatMap((sampleTick, index) =>
      DOSES.filter((dose) => dose.sample === sampleOfDay(sampleTick)).map(
        ({ units, kind }) => ({ position: positionOf(index), units, kind }),
      ),
    ),
    timeLabels: Array.from({ length: TIME_AXIS_LABELS }, (_, index) =>
      formatSampleTime(
        tick - (TIME_AXIS_LABELS - 1 - index) * SAMPLES_PER_TIME_LABEL,
      ),
    ),
  };
}

export type TrendWindow = ReturnType<typeof trendAt>;
