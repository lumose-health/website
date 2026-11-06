import type { RangeHours } from "@/lib/v2/dashboard-range";
import type { TrendWindow } from "@/lib/v2/simulated-glucose";
import {
  LaneHeader,
  LanePlot,
  TrendLayer,
  arrivalProps,
  dotPath,
  dotWidth,
} from "./lane-frame";

const LANE_HEIGHT = 60;
// Dots land on whole coordinates, so a finer grid keeps the curve from stepping.
const VIEW_SCALE = 10;
const BASELINE_Y = 58;
const PIXELS_PER_UNIT = 56 / 4.5;
const AXIS_VALUES = [4, 2, 0];
const IOB_COLOR = "#5FD4E0";

const unitsToY = (units: number) => BASELINE_Y - units * PIXELS_PER_UNIT;

type LaneIobProps = Pick<TrendWindow, "samples"> & {
  hours: RangeHours;
  baseTick: number;
};

export function LaneIob({ samples, hours, baseTick }: LaneIobProps) {
  const toPoint = ({ position, iobUnits }: TrendWindow["samples"][number]) => ({
    x: position * 1000,
    y: unitsToY(iobUnits) * VIEW_SCALE,
  });
  const dot = {
    stroke: IOB_COLOR,
    strokeWidth: dotWidth(hours),
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke",
    fill: "none",
  } as const;

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
        <TrendLayer key={hours}>
          <svg
            viewBox={`0 0 1000 ${LANE_HEIGHT * VIEW_SCALE}`}
            preserveAspectRatio="none"
            className="block size-full"
          >
            <path
              d={dotPath(
                samples.filter(({ tick }) => tick < baseTick).map(toPoint),
              )}
              {...dot}
            />
            {samples
              .filter(({ tick }) => tick >= baseTick)
              .map((sample) => (
                <path
                  key={sample.tick}
                  {...arrivalProps(sample.tick, baseTick)}
                  d={dotPath([toPoint(sample)])}
                  {...dot}
                />
              ))}
          </svg>
        </TrendLayer>
      </LanePlot>
    </div>
  );
}
