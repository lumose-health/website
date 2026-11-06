import { memo, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  LEAD_SAMPLES,
  rangeSamples,
  trendPhase,
} from "@/lib/v2/dashboard-range";
import type { RangeHours } from "@/lib/v2/dashboard-range";
import {
  DEMO_START_TICK,
  timeLabelsAt,
  trendAt,
} from "@/lib/v2/simulated-glucose";
import { AppCard } from "../browser-frame";
import { LaneBasal } from "./lane-basal";
import { LaneDoses } from "./lane-doses";
import { LaneGlucose } from "./lane-glucose";
import { LaneIob } from "./lane-iob";
import { TimeAxis } from "./time-axis";
import { useShownOnce } from "./use-dashboard-tick";

// The lanes' draw-on in globals.css runs for this long.
const DRAW_MS = 1200;

type TrendLanesProps = { baseTick: number; hours: RangeHours };

// Memoized, so a tick leaves this alone. It renders again when the samples drawn
// ahead run out, or when the range changes.
const TrendLanes = memo(function TrendLanes({
  baseTick,
  hours,
}: TrendLanesProps) {
  const windowSamples = rangeSamples(hours);
  const drawnSamples = windowSamples + LEAD_SAMPLES - 1;
  const { samples, doses } = trendAt(baseTick + LEAD_SAMPLES - 1, drawnSamples);
  const layout = {
    "--lm-trend-span": (drawnSamples - 1) / (windowSamples - 1),
  } as CSSProperties;

  return (
    <div className="flex flex-col gap-1" style={layout}>
      <LaneDoses doses={doses} hours={hours} baseTick={baseTick} />
      <LaneGlucose samples={samples} hours={hours} baseTick={baseTick} />
      <LaneIob samples={samples} hours={hours} baseTick={baseTick} />
      <LaneBasal samples={samples} hours={hours} />
    </div>
  );
});

/**
 * Moves the drawn lanes straight on the elements that change. Setting one value
 * on a parent would restyle every lane on every tick.
 */
function slideLanes(plots: HTMLElement, slide: number, hours: RangeHours) {
  const steps = rangeSamples(hours) + LEAD_SAMPLES - 2;
  plots.querySelectorAll<HTMLElement>(".lm-trend-layer").forEach((layer) => {
    layer.style.translate = `${(-100 * slide) / steps}% 0`;
  });
  plots.querySelectorAll<HTMLElement>("[data-lm-arrival]").forEach((sample) => {
    const arrived = Number(sample.dataset.lmArrival) <= slide;
    if (sample.hasAttribute("data-lm-arrived") !== arrived) {
      sample.toggleAttribute("data-lm-arrived", arrived);
    }
  });
}

type TrendProps = {
  tick: number;
  hours: RangeHours;
  /** Called once the lanes have drawn. */
  onDrawn: () => void;
};

export function Trend({ tick, hours, onDrawn }: TrendProps) {
  const { baseTick, slide } = trendPhase(tick, DEMO_START_TICK);
  const drawRef = useShownOnce(0.25, DRAW_MS, onDrawn);
  const plotsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (plotsRef.current) slideLanes(plotsRef.current, slide, hours);
  }, [baseTick, slide, hours]);

  return (
    <div ref={drawRef} aria-hidden="true" className="lm-trend-draw mt-3">
      <AppCard title="Glucose Trend">
        <div className="px-3.5 pt-3.5 pb-2.5">
          <div ref={plotsRef} className="lm-trend-plots">
            <TrendLanes baseTick={baseTick} hours={hours} />
          </div>
          <TimeAxis timeLabels={timeLabelsAt(tick, rangeSamples(hours))} />
        </div>
      </AppCard>
    </div>
  );
}
