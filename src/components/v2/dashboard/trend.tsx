import { Clock } from "lucide-react";
import type { TrendWindow } from "@/lib/v2/simulated-glucose";
import { AppCard } from "../browser-frame";
import { LaneBasal } from "./lane-basal";
import { LaneDoses } from "./lane-doses";
import { LaneGlucose } from "./lane-glucose";
import { LaneIob } from "./lane-iob";
import { TimeAxis } from "./time-axis";

export function Trend({ trend }: { trend: TrendWindow }) {
  const { samples, doses, timeLabels } = trend;

  return (
    <>
      <div className="mt-3 flex min-h-[54px] items-center gap-2 border-y border-[#2C333C] font-lm-mono text-[12px] font-bold tablet:text-[11px]">
        <Clock className="size-[13px]" />
        Last 24 hours
      </div>
      <AppCard title="Glucose Trend" className="mt-3">
        <div className="flex flex-col gap-1 px-3.5 pt-3.5 pb-2.5">
          <LaneDoses doses={doses} />
          <LaneGlucose samples={samples} />
          <LaneIob samples={samples} />
          <LaneBasal samples={samples} />
          <TimeAxis timeLabels={timeLabels} />
        </div>
      </AppCard>
    </>
  );
}
