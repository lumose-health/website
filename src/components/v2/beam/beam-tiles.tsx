"use client";

import { createContext, useCallback, useContext, useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BeamMark } from "@/data/beam-marks";
import { flags } from "@/data/flags";
import { LOCAL_RUNTIMES } from "@/data/providers";
import type { LocalRuntime } from "@/data/providers";
import { labelSlot } from "@/lib/v2/label-rotation";
import type { LabelSlot } from "@/lib/v2/label-rotation";
import { useLabelRotation } from "@/lib/v2/use-label-rotation";
import { useShownOnce } from "../dashboard/use-dashboard-tick";
import { LogoIcon } from "../logo";

// The pieces both layouts share. The layouts only differ in where things sit.

/** Which local runtime's logo the stage is showing. */
const RuntimeIndex = createContext(0);

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
  // The local model tile steps through its runtimes with the same region as the
  // pulses, so it stops with them. Nothing to step through without the logos.
  const rotation = useLabelRotation(
    flags.logosCleared ? LOCAL_RUNTIMES.length : 1,
  );
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
    <div {...rotation.region} className={className}>
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
        <RuntimeIndex value={rotation.index}>{children}</RuntimeIndex>
      </div>
    </div>
  );
}

const TILE_SIZE = 52;
const LOGO_SIZE = { tile: 28, node: 22 };

// A cross-fade rather than the button's roll, which would cut the marks off in
// a square window inside the round tile. Each mark is shown as it comes, with
// no tint. A stopped loop drops the fade, so a change caught mid-way snaps.
const FADE =
  "transition-opacity duration-(--lm-dur-base) ease-(--ease-lm-in-out) motion-reduce:transition-none in-data-[lm-loop=frozen]:transition-none";
const FADE_SLOT: Record<LabelSlot, string> = {
  current: FADE,
  previous: `${FADE} opacity-0`,
  waiting: "opacity-0",
};

/**
 * Every logo stacked in one cell, so the tile never changes size. All of them
 * load with the page, so none arrives mid-fade.
 */
function RotatingLogo({
  runtimes,
  size,
}: {
  runtimes: readonly LocalRuntime[];
  size: number;
}) {
  const index = useContext(RuntimeIndex);
  return (
    <span className="grid" style={{ width: size, height: size }}>
      {runtimes.map((runtime, position) => (
        // eslint-disable-next-line @next/next/no-img-element -- static export, and the diagram's text alternative has the name
        <img
          key={runtime.name}
          src={runtime.logo}
          alt=""
          width={size}
          height={size}
          loading="eager"
          fetchPriority="low"
          decoding="async"
          className={`[grid-area:1/1] ${FADE_SLOT[labelSlot(position, index, runtimes.length)]}`}
        />
      ))}
    </span>
  );
}

/** Placed by its center. */
export function BeamTile({
  mark,
  shape,
  x,
  y,
}: {
  mark: BeamMark;
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
      {!flags.logosCleared ? (
        <span
          className={`font-lm-mono leading-none font-medium text-lm-ink-secondary ${isTile ? "text-[22px]" : "text-base"}`}
        >
          {mark.initials}
        </span>
      ) : mark.runtimes ? (
        <RotatingLogo runtimes={mark.runtimes} size={logoSize} />
      ) : (
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
