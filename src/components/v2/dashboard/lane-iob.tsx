import type { TrendWindow } from "@/lib/v2/simulated-glucose";
import { LaneHeader, LanePlot, dotPath } from "./lane-frame";

const LANE_HEIGHT = 60;
// Dots land on whole coordinates, so a finer grid keeps the curve from stepping.
const VIEW_SCALE = 10;
const BASELINE_Y = 58;
const PIXELS_PER_UNIT = 56 / 4.5;
const AXIS_VALUES = [4, 2, 0];
const IOB_COLOR = "#5FD4E0";

const unitsToY = (units: number) => BASELINE_Y - units * PIXELS_PER_UNIT;

export function LaneIob({ samples }: Pick<TrendWindow, "samples">) {
  return (
    <div className="hidden tablet:block">
      <LaneHeader
        unit="U"
        heading="Insulin on board"
        legend={[
          {
            label: "Reported samples",
            swatch: "border border-[#5FD4E0] bg-[#5FD4E0]/15",
          },
        ]}
      />
      <LanePlot
        height={LANE_HEIGHT}
        yLabels={AXIS_VALUES.map((value) => ({
          label: String(value),
          position: unitsToY(value) / LANE_HEIGHT,
        }))}
      >
        <svg
          viewBox={`0 0 1000 ${LANE_HEIGHT * VIEW_SCALE}`}
          preserveAspectRatio="none"
          className="block size-full"
        >
          <path
            d={dotPath(
              samples.map(({ position, iobUnits }) => ({
                x: position * 1000,
                y: unitsToY(iobUnits) * VIEW_SCALE,
              })),
            )}
            stroke={IOB_COLOR}
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
      </LanePlot>
    </div>
  );
}
