import type { TrendWindow } from "@/lib/v2/simulated-glucose";
import { LaneHeader, LanePlot } from "./lane-frame";

const LANE_HEIGHT = 46;
const BASELINE_Y = 44;
const PIXELS_PER_UNIT = 40 / 2.5;
const AXIS_VALUES = [2.5, 0];
const BASAL_COLOR = "var(--color-lm-blue-light)";

const rateToY = (rate: number) => BASELINE_Y - rate * PIXELS_PER_UNIT;

/** The line only turns where the rate changes, so it draws as steps. */
function stepLine(samples: TrendWindow["samples"]) {
  const [first] = samples;
  let previousY = rateToY(first.basalUnitsPerHour);
  let line = `M0 ${previousY.toFixed(1)}`;

  for (const { position, basalUnitsPerHour } of samples) {
    const y = rateToY(basalUnitsPerHour);
    if (y === previousY) continue;
    const x = (position * 1000).toFixed(1);
    line += ` L${x} ${previousY.toFixed(1)} L${x} ${y.toFixed(1)}`;
    previousY = y;
  }

  return `${line} L1000 ${previousY.toFixed(1)}`;
}

export function LaneBasal({ samples }: Pick<TrendWindow, "samples">) {
  const line = stepLine(samples);

  return (
    <div className="hidden tablet:block">
      <LaneHeader
        unit="U/hr"
        heading="Pump basal"
        legend={[
          {
            label: "Basal delivery",
            swatch: "border border-lm-blue-light bg-lm-blue-light/15",
          },
        ]}
      />
      <LanePlot
        height={LANE_HEIGHT}
        yLabels={AXIS_VALUES.map((value) => ({
          label: String(value),
          position: rateToY(value) / LANE_HEIGHT,
        }))}
      >
        <svg
          viewBox={`0 0 1000 ${LANE_HEIGHT}`}
          preserveAspectRatio="none"
          className="block size-full"
        >
          <path
            d={`${line} L1000 ${LANE_HEIGHT} L0 ${LANE_HEIGHT} Z`}
            fill={BASAL_COLOR}
            fillOpacity="0.18"
          />
          <path
            d={line}
            stroke={BASAL_COLOR}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
      </LanePlot>
    </div>
  );
}
