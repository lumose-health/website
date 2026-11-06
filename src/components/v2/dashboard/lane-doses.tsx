import type { DoseKind, TrendWindow } from "@/lib/v2/simulated-glucose";
import { LaneHeader, LanePlot } from "./lane-frame";

const LANE_HEIGHT = 62;

// As in the real chart, a bigger dose reaches further down the lane.
const STEM_PIXELS_PER_UNIT = 10;

const DOSE_STYLES: Record<DoseKind, { stem: string; border: string }> = {
  manual: { stem: "bg-lm-bolus-manual", border: "border-lm-bolus-manual" },
  auto: { stem: "bg-lm-bolus-auto", border: "border-lm-bolus-auto" },
};

export function LaneDoses({ doses }: Pick<TrendWindow, "doses">) {
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
        {doses.map(({ position, units, kind }) => {
          const { stem, border } = DOSE_STYLES[kind];
          return (
            <div
              key={position}
              className="absolute top-0 flex w-[26px] -translate-x-1/2 flex-col items-center"
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
      </LanePlot>
    </div>
  );
}
