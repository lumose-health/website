"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useLoopRegion } from "@/lib/v2/use-loop-region";
import { useMotion } from "./motion-provider";

// The hero's client pieces. HeroField and HeroTile stay server components, so
// the static art doesn't ship in the client bundle.

// 1100px. Below this the headline reaches the tiles and the mask hides nearly all
// of each comet, so they don't mount at all.
const WIDE_QUERY = "(min-width: 68.75rem)";

// The root theme provider switches transitions off for a moment at hydration, so
// tiles wait that out.
const TILES_ENTER_MS = 50;
// Then five 60ms staggers and the last tile's 400ms.
const TILES_SETTLED_MS = TILES_ENTER_MS + 700;

const DASH_LENGTH = 70;
const TRAVEL = 0.55;

// A lead rather than a delay, so the layer starts with comets partway along.
function cometTiming(index: number) {
  const tile = Math.floor(index / 3);
  const strand = index % 3;
  return {
    durationS: 1.9 + strand * 0.35 + (tile % 3) * 0.25,
    leadS: tile * 0.37 + strand * 0.8,
  };
}

type Comet = {
  paths: SVGElement[];
  length: number;
  durationS: number;
  leadS: number;
};

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

const returnFalse = () => false;

type Strand = { d: string; color: string };

function CometLayer({
  strands,
  viewBox,
}: {
  strands: Strand[];
  viewBox: string;
}) {
  const group = useRef<SVGGElement>(null);
  const comets = useRef<Comet[]>([]);
  const started = useRef(false);

  const region = useLoopRegion<SVGSVGElement>({
    onFrame(elapsedMs) {
      const seconds = (elapsedMs - TILES_SETTLED_MS) / 1000;
      if (seconds < 0) return;

      try {
        if (!started.current && group.current) {
          started.current = true;
          group.current.style.opacity = "1";
        }

        for (const comet of comets.current) {
          const progress =
            ((seconds + comet.leadS) % comet.durationS) / comet.durationS;
          const offset = (
            DASH_LENGTH -
            progress * (comet.length * TRAVEL + DASH_LENGTH)
          ).toFixed(1);
          for (const path of comet.paths) {
            path.style.strokeDashoffset = offset;
          }
        }
      } catch (error) {
        // The scheduler drops this region, so don't leave comets stuck mid-flight.
        if (group.current) group.current.style.opacity = "0";
        throw error;
      }
    },
  });

  // Read once. Measuring or querying per frame is what the budget rules out.
  useEffect(() => {
    if (!group.current) return;
    comets.current = Array.from(group.current.children, (comet, index) => {
      const paths = Array.from(comet.children) as SVGPathElement[];
      const length = paths[0].getTotalLength();
      return { paths, length, ...cometTiming(index) };
    });
  }, []);

  return (
    // preserveAspectRatio="none" keeps comets on the strands. They leave out
    // non-scaling-stroke because it would measure dashes in screen pixels.
    <svg
      {...region}
      aria-hidden="true"
      viewBox={viewBox}
      preserveAspectRatio="none"
      className="lm-hero-comets absolute inset-0 size-full"
    >
      <g ref={group} fill="none" strokeLinecap="round">
        {strands.map((strand) => (
          <g key={strand.d} stroke={strand.color}>
            {/* A wide faint stroke gives the soft edge without an SVG effect. */}
            <path
              d={strand.d}
              strokeWidth={7}
              strokeOpacity={0.22}
              strokeDasharray={`${DASH_LENGTH} 4000`}
              strokeDashoffset={DASH_LENGTH}
            />
            <path
              d={strand.d}
              strokeWidth={2.4}
              strokeDasharray={`${DASH_LENGTH} 4000`}
              strokeDashoffset={DASH_LENGTH}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function HeroComets(props: { strands: Strand[]; viewBox: string }) {
  const { reduced } = useMotion();
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    returnFalse,
  );

  if (!wide || reduced) return null;
  return <CometLayer {...props} />;
}

export function HeroGlow() {
  const region = useLoopRegion();
  return <div {...region} aria-hidden="true" className="lm-hero-glow" />;
}

export function HeroTileItem({
  index,
  className,
  style,
  children,
}: {
  index: number;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const region = useLoopRegion<HTMLLIElement>();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), TILES_ENTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <li
      {...region}
      data-entered={entered ? "" : undefined}
      className={`lm-hero-tile ${className}`}
      style={{ ...style, "--lm-tile-index": index } as CSSProperties}
    >
      {children}
    </li>
  );
}
