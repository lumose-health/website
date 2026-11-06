import type { ReactNode } from "react";

// Twelve grid divisions across the plot, as in the design.
const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "8.333% 100%",
};

type LegendItem = { label: string; swatch: string };

type LaneHeaderProps = {
  unit: string;
  heading: string;
  legend: LegendItem[];
};

/** A mono strip with the unit, the lane name and its key, as in the real chart. */
export function LaneHeader({ unit, heading, legend }: LaneHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between gap-1.5 rounded-[3px] bg-lm-app-panel-header px-2.5 py-[7px] font-lm-mono text-[12px] font-bold tablet:text-[11px]">
      <span>
        <span className="mr-2 border-r border-lm-app-text-muted pr-2">
          {unit}
        </span>
        {heading}
      </span>
      <span className="flex flex-wrap gap-x-3 text-[#E3E8EE]">
        {legend.map(({ label, swatch }) => (
          <span key={label} className="inline-flex items-center gap-[5px]">
            <span className={`size-[9px] rounded-[2px] ${swatch}`} />
            {label}
          </span>
        ))}
      </span>
    </div>
  );
}

type LanePlotProps = {
  /** Plot height in pixels. */
  height: number;
  /** Axis labels, each with its distance down the plot from 0 to 1. */
  yLabels?: { label: string; position: number }[];
  children: ReactNode;
};

/** A plot area with the shared grid and its value axis in the left gutter. */
export function LanePlot({ height, yLabels = [], children }: LanePlotProps) {
  return (
    <div className="relative pl-[34px]">
      {yLabels.map(({ label, position }) => (
        <span
          key={label}
          className="absolute left-0 w-7 -translate-y-1/2 text-right text-[12px] leading-none text-lm-app-text-muted tablet:text-[10px]"
          style={{ top: position * height }}
        >
          {label}
        </span>
      ))}
      <div
        className="relative overflow-hidden"
        style={{ height, ...GRID_STYLE }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The part of a plot that moves. It's wider than the plot by the samples drawn
 * ahead, and each tick slides it left by one sample. A new range remounts it,
 * which fades it in.
 */
export function TrendLayer({ children }: { children: ReactNode }) {
  return <div className="lm-trend-layer">{children}</div>;
}

/**
 * Keeps a sample drawn ahead hidden until the tick reaches it, then fades it in.
 * The newest sample of a fresh draw has already arrived.
 */
export function arrivalProps(tick: number, baseTick: number) {
  return {
    className: "lm-trend-arrival",
    "data-lm-arrival": tick - baseTick,
    "data-lm-arrived": tick === baseTick ? "" : undefined,
  };
}

/** Shorter ranges have room for bigger dots, as in the real chart. */
export function dotWidth(hours: number) {
  return hours > 12 ? 3 : 5;
}

/** Round caps on zero-length strokes draw a dot that stays round when stretched. */
export function dotPath(points: { x: number; y: number }[]) {
  return points
    .map(({ x, y }) => `M${Math.round(x)} ${Math.round(y)}h0.01`)
    .join("");
}
