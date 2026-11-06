import { memo } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  ZoomOut,
} from "lucide-react";
import {
  DEFAULT_RANGE,
  cycleRange,
  rangeLabel,
  stepRange,
} from "@/lib/v2/dashboard-range";
import type { RangeHours } from "@/lib/v2/dashboard-range";
import { FOCUS_RING } from "../button";

const BUTTON = `inline-flex min-h-lm-touch min-w-lm-touch cursor-pointer items-center justify-center gap-2 border-r border-[#3A414B] bg-[#20242A] last:border-r-0 focus-visible:relative aria-disabled:cursor-not-allowed aria-disabled:text-lm-app-text-muted ${FOCUS_RING}`;

type RangeControlProps = {
  hours: RangeHours;
  onChange: (hours: RangeHours) => void;
};

/** The only live control in the mockup, which is why it sits outside the image. */
export const RangeControl = memo(function RangeControl({
  hours,
  onChange,
}: RangeControlProps) {
  const atShortest = stepRange(hours, -1) === hours;
  const atLongest = stepRange(hours, 1) === hours;

  // aria-disabled rather than disabled, because a button that disables itself
  // when pressed would throw keyboard focus off the control.
  return (
    <div className="mt-3 flex min-h-[54px] items-center border-y border-[#2C333C]">
      <div
        role="group"
        aria-label="Time range"
        className="relative inline-flex rounded-[3px] border border-[#3A414B] font-lm-mono text-[12px] font-bold text-lm-app-text tablet:text-[11px]"
      >
        <button
          type="button"
          aria-label="Shorter range"
          aria-disabled={atShortest}
          className={BUTTON}
          onClick={() => onChange(stepRange(hours, -1))}
        >
          <ChevronsLeft size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${BUTTON} px-3`}
          onClick={() => onChange(cycleRange(hours))}
        >
          <Clock size={13} aria-hidden="true" />
          {rangeLabel(hours)}
          <ChevronDown size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Longer range"
          aria-disabled={atLongest}
          className={BUTTON}
          onClick={() => onChange(stepRange(hours, 1))}
        >
          <ChevronsRight size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className={BUTTON}
          onClick={() => onChange(DEFAULT_RANGE)}
        >
          <ZoomOut size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
