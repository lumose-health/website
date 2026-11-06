import type { DashboardSnapshot, GlucoseBand } from "@/lib/v2/simulated-glucose";
import { AppCard } from "../browser-frame";
import { useShownOnce } from "./use-dashboard-tick";

const BAND_COLORS: Record<GlucoseBand, string> = {
  "in-range": "text-lm-glucose-in-range",
  "high-low": "text-lm-glucose-high-low",
  urgent: "text-lm-glucose-urgent",
};

const RIGHT_HALF = "M75 17 A58 58 0 0 1 75 133";
const LEFT_HALF = "M75 133 A58 58 0 0 1 75 17";

type CgmCardProps = Pick<
  DashboardSnapshot,
  "glucose" | "band" | "pointerDegrees"
> & {
  updated: string;
};

export function CgmCard({
  glucose,
  band,
  pointerDegrees,
  updated,
}: CgmCardProps) {
  const sweepRef = useShownOnce(0.25);

  return (
    <div ref={sweepRef} className="lm-cgm">
      <AppCard title="Live CGM">
        <div className="px-3.5 pt-2.5 pb-3.5">
          <div className="flex justify-between font-lm-mono text-[12px] font-bold text-lm-app-text-muted tablet:text-[10px]">
            <span>[mg/dL]</span>
            <span>{`Updated ${updated}`}</span>
          </div>
          <div className="flex justify-center pt-1.5">
            <div
              className={`lm-cgm-face relative h-[132px] w-[150px] ${BAND_COLORS[band]}`}
            >
              <svg width="150" height="132" viewBox="0 0 170 150">
                <g
                  className="lm-cgm-pointer"
                  style={{ rotate: `${pointerDegrees}deg` }}
                >
                  <path d="M118 40 L162 75 L118 110 Z" fill="currentColor" />
                </g>
                <circle
                  cx="75"
                  cy="75"
                  r="58"
                  fill="var(--color-lm-app-panel)"
                />
                {/* Two halves, each turning into its own clip, so the sweep is
                    made of transforms. Square caps close the seam between them. */}
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="square"
                >
                  <g clipPath="url(#lm-cgm-right)">
                    <path
                      className="lm-cgm-half lm-cgm-half-first"
                      d={RIGHT_HALF}
                    />
                  </g>
                  <g clipPath="url(#lm-cgm-left)">
                    <path
                      className="lm-cgm-half lm-cgm-half-second"
                      d={LEFT_HALF}
                    />
                  </g>
                </g>
                <clipPath id="lm-cgm-right">
                  <rect x="74.5" width="95.5" height="150" />
                </clipPath>
                <clipPath id="lm-cgm-left">
                  <rect width="75.5" height="150" />
                </clipPath>
              </svg>
              <span className="absolute top-0 left-0 flex size-[132px] items-center justify-center font-lm-body text-[36px] font-bold text-lm-app-text">
                {glucose}
              </span>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
