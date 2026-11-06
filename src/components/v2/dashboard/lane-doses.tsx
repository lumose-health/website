import type { RangeHours } from "@/lib/v2/dashboard-range";
import type { DoseKind, TrendWindow } from "@/lib/v2/simulated-glucose";
import { LaneHeader, LanePlot, TrendLayer, arrivalProps } from "./lane-frame";

const LANE_HEIGHT = 62;

// As in the real chart, a bigger dose reaches further down the lane.
const STEM_PIXELS_PER_UNIT = 10;

const DOSE_STYLES: Record<DoseKind, { stem: string; border: string }> = {
  manual: { stem: "bg-lm-bolus-manual", border: "border-lm-bolus-manual" },
  auto: { stem: "bg-lm-bolus-auto", border: "border-lm-bolus-auto" },
};

type LaneDosesProps = Pick<TrendWindow, "doses"> & {
  hours: RangeHours;
  baseTick: number;
};

export function LaneDoses({ doses, hours, baseTick }: LaneDosesProps) {
  return (
    <div className="hidden tablet:block">
      <LaneHeader
        unit="U"
        heading="Insulin doses"
        legend={[
          { label: "Manual bolus", swatch: "bg-lm-bolus-manual" },
          { label: "Auto correction", swatch: "bg-lm-bolus-auto" },
        ]}
      />
      <LanePlot height={LANE_HEIGHT}>
        <TrendLayer key={hours}>
          {doses.map(({ tick, position, units, kind }) => {
            const { stem, border } = DOSE_STYLES[kind];
            const { className = "", ...arrival } =
              tick >= baseTick ? arrivalProps(tick, baseTick) : {};
            return (
              <div
                key={tick}
                {...arrival}
                className={`absolute top-0 flex w-[26px] -translate-x-1/2 flex-col items-center ${className}`}
                style={{ left: `${position * 100}%` }}
              >
                <span
                  className={`w-0.5 ${stem}`}
                  style={{ height: units * STEM_PIXELS_PER_UNIT }}
                />
                <span
                  className={`flex size-6 items-center justify-center rounded-full border-[1.5px] bg-lm-app-panel font-lm-mono text-[8px] font-bold ${border}`}
                >
                  {Number(units.toFixed(2))}
                </span>
              </div>
            );
          })}
        </TrendLayer>
      </LanePlot>
    </div>
  );
}
