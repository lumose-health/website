import type { DashboardSnapshot, GlucoseBand } from "@/lib/v2/simulated-glucose";
import { AppCard } from "../browser-frame";

const BAND_COLORS: Record<GlucoseBand, string> = {
  "in-range": "text-lm-glucose-in-range",
  "high-low": "text-lm-glucose-high-low",
  urgent: "text-lm-glucose-urgent",
};

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
  return (
    <AppCard title="Live CGM">
      <div className="px-3.5 pt-2.5 pb-3.5">
        <div className="flex justify-between font-lm-mono text-[12px] font-bold text-lm-app-text-muted tablet:text-[10px]">
          <span>[mg/dL]</span>
          <span>{`Updated ${updated}`}</span>
        </div>
        <div className="flex justify-center pt-1.5">
          <div className={`relative h-[132px] w-[150px] ${BAND_COLORS[band]}`}>
            <svg width="150" height="132" viewBox="0 0 170 150">
              <g transform={`rotate(${pointerDegrees} 75 75)`}>
                <path d="M118 40 L162 75 L118 110 Z" fill="currentColor" />
              </g>
              <circle
                cx="75"
                cy="75"
                r="58"
                fill="var(--color-lm-app-panel)"
                stroke="currentColor"
                strokeWidth="6"
              />
            </svg>
            <span className="absolute top-0 left-0 flex size-[132px] items-center justify-center font-lm-body text-[36px] font-bold text-lm-app-text">
              {glucose}
            </span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
