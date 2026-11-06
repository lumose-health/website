import type { GlucoseBand, TrendWindow } from "@/lib/v2/simulated-glucose";
import { LaneHeader, LanePlot, dotPath } from "./lane-frame";

const LANE_HEIGHT = 200;
const VIEW_HEIGHT = 260;

// The real chart's default range.
const DOMAIN_MIN = 40;
const DOMAIN_MAX = 300;
const TARGET_LOW = 70;
const TARGET_HIGH = 180;
const AXIS_VALUES = [275, 225, 175, 125, 75];

const BAND_STROKES: Record<GlucoseBand, string> = {
  "in-range": "var(--color-lm-glucose-in-range)",
  "high-low": "var(--color-lm-glucose-high-low)",
  urgent: "var(--color-lm-glucose-urgent)",
};
const BANDS = Object.keys(BAND_STROKES) as GlucoseBand[];

const LEGEND = [
  {
    label: `Target ${TARGET_LOW} to ${TARGET_HIGH}`,
    swatch: "border border-lm-glucose-in-range bg-lm-glucose-in-range/15",
  },
  {
    label: `High > ${TARGET_HIGH} / Low < ${TARGET_LOW}`,
    swatch: "border border-lm-glucose-high-low bg-lm-glucose-high-low/15",
  },
  {
    label: "Urgent high > 250 / Urgent low < 55",
    swatch: "border border-lm-glucose-urgent bg-lm-glucose-urgent/15",
  },
];

function fractionDown(glucose: number) {
  const clamped = Math.max(DOMAIN_MIN, Math.min(DOMAIN_MAX, glucose));
  return (DOMAIN_MAX - clamped) / (DOMAIN_MAX - DOMAIN_MIN);
}

export function LaneGlucose({ samples }: Pick<TrendWindow, "samples">) {
  const bandTop = fractionDown(TARGET_HIGH) * VIEW_HEIGHT;
  const bandBottom = fractionDown(TARGET_LOW) * VIEW_HEIGHT;

  return (
    <div>
      <LaneHeader unit="mg/dL" heading="Glucose" legend={LEGEND} />
      <LanePlot
        height={LANE_HEIGHT}
        yLabels={AXIS_VALUES.map((value) => ({
          label: String(value),
          position: fractionDown(value),
        }))}
      >
        <svg
          viewBox={`0 0 1000 ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          className="block size-full"
        >
          <rect
            x="0"
            y={bandTop}
            width="1000"
            height={bandBottom - bandTop}
            fill="var(--color-lm-glucose-band)"
            fillOpacity="0.55"
          />
          {[bandTop, bandBottom].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1000"
              y2={y}
              stroke="var(--color-lm-glucose-high-low)"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {BANDS.map((band) => (
            <path
              key={band}
              d={dotPath(
                samples
                  .filter((sample) => sample.band === band)
                  .map(({ position, glucose }) => ({
                    x: position * 1000,
                    y: fractionDown(glucose) * VIEW_HEIGHT,
                  })),
              )}
              stroke={BAND_STROKES[band]}
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          ))}
        </svg>
      </LanePlot>
    </div>
  );
}
