"use client";

import { useCallback, useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { flags } from "@/data/flags";
import { useLoopRegion } from "@/lib/v2/use-loop-region";
import { useShownOnce } from "../dashboard/use-dashboard-tick";
import { LogoIcon } from "../logo";

// The pieces both layouts share. The layouts only differ in where things sit.

type Mark = {
  name: string;
  /** Shown when `flags.logosCleared` is off. */
  initials: string;
  logo: string;
};

export const BEAM_DEVICES: Mark[] = [
  { name: "Dexcom", initials: "D", logo: "/vendors/dexcom.png" },
  { name: "Tandem", initials: "T", logo: "/vendors/tandem.png" },
  { name: "Medtronic", initials: "M", logo: "/vendors/medtronic.jpg" },
  { name: "Glooko", initials: "G", logo: "/vendors/glooko.png" },
  { name: "Nightscout", initials: "N", logo: "/vendors/nightscout.png" },
];

// Two letters, since one would read C, O, C, O.
export const BEAM_PROVIDERS: Mark[] = [
  { name: "Claude", initials: "Cl", logo: "/ai-providers/claude.svg" },
  { name: "OpenAI", initials: "Op", logo: "/ai-providers/openai.svg" },
  { name: "Copilot", initials: "Co", logo: "/ai-providers/githubcopilot.svg" },
  { name: "Ollama", initials: "Ol", logo: "/ai-providers/ollama.svg" },
];

type Point = readonly [x: number, y: number];
export type BeamCurve = readonly [Point, Point, Point, Point];

const PATH_DRAW_MS = 800;
const PATH_STAGGER_MS = 40;
// The last of the 9 paths finishes here, which is when pulses start.
const DRAW_MS = PATH_DRAW_MS + 8 * PATH_STAGGER_MS;

const VIEW_THRESHOLD = 0.3;

function toPath([start, control1, control2, end]: BeamCurve) {
  return `M ${start[0]} ${start[1]} C ${control1[0]} ${control1[1]}, ${control2[0]} ${control2[1]}, ${end[0]} ${end[1]}`;
}

function pointAt(curve: BeamCurve, t: number, axis: 0 | 1) {
  const u = 1 - t;
  return (
    u * u * u * curve[0][axis] +
    3 * u * u * t * curve[1][axis] +
    3 * u * t * t * curve[2][axis] +
    t * t * t * curve[3][axis]
  );
}

// Worked out rather than measured, so it's in the static HTML and doesn't depend
// on the layout being on screen.
function curveLength(curve: BeamCurve) {
  const STEPS = 64;
  let length = 0;
  for (let step = 1; step <= STEPS; step += 1) {
    const before = (step - 1) / STEPS;
    const after = step / STEPS;
    length += Math.hypot(
      pointAt(curve, after, 0) - pointAt(curve, before, 0),
      pointAt(curve, after, 1) - pointAt(curve, before, 1),
    );
  }
  return length.toFixed(1);
}

type Axis = "x" | "y";

// userSpaceOnUse because the straight middle path has an empty bounding box, and a
// gradient measured against that box doesn't paint at all.
function gradientLine(axis: Axis, from: number, to: number) {
  return {
    gradientUnits: "userSpaceOnUse",
    ...(axis === "x"
      ? { x1: from, x2: to, y1: 0, y2: 0 }
      : { x1: 0, x2: 0, y1: from, y2: to }),
  } as const;
}

function BeamGradients({
  id,
  axis,
  from,
  to,
}: {
  id: string;
  axis: Axis;
  from: number;
  to: number;
}) {
  const span = to - from;
  return (
    <>
      <linearGradient id={`${id}-pulse`} {...gradientLine(axis, from, to)}>
        <stop offset="0" stopColor="#45D3FF" stopOpacity="0" />
        <stop offset="0.5" stopColor="#45D3FF" />
        <stop offset="1" stopColor="#118DFF" stopOpacity="0" />
      </linearGradient>
      {/* Fades in along the direction of travel, then stops short, so one still
          segment points the way the pulses run. */}
      <linearGradient
        id={`${id}-rest`}
        {...gradientLine(axis, from + span * 0.35, from + span * 0.72)}
      >
        <stop offset="0" stopColor="#45D3FF" stopOpacity="0" />
        <stop offset="0.97" stopColor="#45D3FF" />
        <stop offset="1" stopColor="#45D3FF" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

function indexed(index: number, curve?: BeamCurve) {
  return {
    "--lm-beam-index": index,
    ...(curve && { "--lm-beam-length": curveLength(curve) }),
  } as CSSProperties;
}

/**
 * The art and timing for one layout. The pulses are CSS keyframes, so nothing runs
 * per frame and the region's `data-lm-loop` freezes them.
 */
export function BeamStage({
  width,
  height,
  axis,
  inbound,
  outbound,
  className,
  children,
}: {
  /** Size of the path art. */
  width: number;
  height: number;
  /** The direction pulses travel in. */
  axis: Axis;
  inbound: BeamCurve[];
  outbound: BeamCurve[];
  className: string;
  children: ReactNode;
}) {
  // Each layout gets its own ids because one of them is always display: none, and
  // a gradient in there wouldn't paint for the other.
  const id = useId();
  const [pulsing, setPulsing] = useState(false);
  const startPulses = useCallback(() => setPulsing(true), []);
  const region = useLoopRegion();
  const shownRef = useShownOnce(VIEW_THRESHOLD, DRAW_MS, startPulses);

  const axisIndex = axis === "x" ? 0 : 1;
  const groups = [
    { curves: inbound, name: "in", first: 0 },
    { curves: outbound, name: "out", first: inbound.length },
  ];
  const lines = groups.flatMap(({ curves, name, first }) =>
    curves.map((curve, position) => ({
      curve,
      d: toPath(curve),
      index: first + position,
      group: name,
    })),
  );

  return (
    <div {...region} className={className}>
      <div
        ref={shownRef}
        data-lm-pulsing={pulsing ? "" : undefined}
        className="lm-beam absolute inset-0"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          className="absolute top-0 left-0"
        >
          <defs>
            {groups.map(({ curves, name }) => (
              <BeamGradients
                key={name}
                id={`${id}-${name}`}
                axis={axis}
                from={curves[0][0][axisIndex]}
                to={curves[0][3][axisIndex]}
              />
            ))}
          </defs>

          {lines.map(({ d, index }) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              stroke="#18212D"
              strokeWidth={2}
              className="lm-beam-base"
              style={indexed(index)}
            />
          ))}
          {lines.map(({ d, group }) => (
            <path
              key={d}
              d={d}
              stroke={`url(#${id}-${group}-rest)`}
              strokeWidth={2.5}
              className="lm-beam-rest"
            />
          ))}
          {lines.map(({ curve, d, index, group }) => (
            <path
              key={d}
              d={d}
              stroke={`url(#${id}-${group}-pulse)`}
              strokeWidth={2.5}
              strokeLinecap="round"
              className={`lm-beam-pulse lm-beam-pulse-${group}`}
              style={indexed(index, curve)}
            />
          ))}
        </svg>
        {children}
      </div>
    </div>
  );
}

const TILE_SIZE = 52;
const LOGO_SIZE = { tile: 28, node: 22 };

/** Placed by its center. */
export function BeamTile({
  mark,
  shape,
  x,
  y,
}: {
  mark: Mark;
  shape: "tile" | "node";
  x: number;
  y: number;
}) {
  const isTile = shape === "tile";
  const logoSize = LOGO_SIZE[shape];

  // Forced colors would swap the card fill for the system canvas, and the light
  // marks vanish on a light one. Opting out keeps a dark plate behind them.
  return (
    <div
      className={`absolute flex size-[52px] items-center justify-center border border-lm-line-pill bg-lm-card forced-color-adjust-none ${isTile ? "rounded-lm-tile" : "rounded-full"}`}
      style={{ left: x - TILE_SIZE / 2, top: y - TILE_SIZE / 2 }}
    >
      {flags.logosCleared ? (
        // Lazy so the layout that's display: none never fetches its copy.
        // eslint-disable-next-line @next/next/no-img-element -- static export, and the diagram's text alternative has the name
        <img
          src={mark.logo}
          alt=""
          width={logoSize}
          height={logoSize}
          loading="lazy"
          decoding="async"
          className={isTile ? "rounded-[7px] object-cover" : undefined}
        />
      ) : (
        <span
          className={`font-lm-mono leading-none font-medium text-lm-ink-secondary ${isTile ? "text-[22px]" : "text-base"}`}
        >
          {mark.initials}
        </span>
      )}
    </div>
  );
}

const CORE_SIZE = 108;

export function BeamCore({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute size-[108px]"
      style={{ left: x - CORE_SIZE / 2, top: y - CORE_SIZE / 2 }}
    >
      {/* The tile glows, never the mark, so this sits behind both. */}
      <div className="lm-beam-glow absolute inset-0 rounded-[30px]" />
      <div className="relative flex size-full items-center justify-center rounded-[30px] border border-[#2E4A6E] bg-[#0E1622]">
        <LogoIcon width={60} height={54} />
      </div>
    </div>
  );
}

export function BeamLabel({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`absolute font-lm-mono text-[11px] tracking-[0.1em] whitespace-nowrap text-lm-ink-faint ${className}`}
    >
      {children}
    </span>
  );
}
