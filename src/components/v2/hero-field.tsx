import { HeroComets, HeroGlow } from "./hero-comets";

export const HERO_VIEWBOX = { width: 1440, height: 860 } as const;

const CORE = { x: 720, y: 380 };
const PALETTE = [
  "#45D3FF",
  "#118DFF",
  "#5EB1FF",
  "#34D399",
  "#45D3FF",
  "#8B7CF6",
];

export type HeroSource = {
  name: string;
  /** Order for the entrance stagger and pulse rings. */
  index: number;
  /** Position in the viewBox. Tiles and strands both start here. */
  x: number;
  y: number;
  /** Shown instead of the initial while `flags.logosCleared` is on. */
  logo?: string;
};

export const HERO_SOURCES: HeroSource[] = [
  { name: "Dexcom", index: 0, x: 130, y: 150, logo: "/vendors/dexcom.png" },
  { name: "Tandem", index: 1, x: 80, y: 360, logo: "/vendors/tandem.png" },
  {
    name: "Medtronic",
    index: 2,
    x: 110,
    y: 560,
    logo: "/vendors/medtronic.jpg",
  },
  {
    name: "Nightscout",
    index: 3,
    x: 1310,
    y: 150,
    logo: "/vendors/nightscout.png",
  },
  { name: "Glooko", index: 4, x: 1360, y: 360, logo: "/vendors/glooko.png" },
  { name: "Loop", index: 5, x: 1330, y: 560, logo: "/vendors/loop.png" },
];

type Line = { d: string; color: string; opacity: number };

const TRACES: Line[] = Array.from({ length: 14 }, (_, i) => {
  const y = 40 + i * 58;
  const rise = y - CORE.y;
  return {
    d: `M -60 ${y} C 320 ${(y + Math.sin(i) * 30).toFixed(1)}, 520 ${(CORE.y + rise * 0.25).toFixed(1)}, ${CORE.x} ${(CORE.y + rise * 0.04).toFixed(1)} S 1120 ${(CORE.y + rise * 0.45).toFixed(1)}, 1500 ${(CORE.y + rise * 0.85).toFixed(1)}`,
    color: PALETTE[i % PALETTE.length],
    opacity: 0.08,
  };
});

// Three strands per tile, each curving into the core.
export const HERO_STRANDS: Line[] = HERO_SOURCES.flatMap((source, i) => {
  const dir = source.x < CORE.x ? 1 : -1;
  return [-14, 0, 14].map((offset, j) => ({
    d: `M ${source.x} ${source.y} C ${source.x + dir * 260} ${source.y + offset * 2}, ${CORE.x - dir * 260} ${CORE.y + offset * 3}, ${CORE.x} ${CORE.y + offset}`,
    color: PALETTE[(i + j) % PALETTE.length],
    opacity: j === 1 ? 0.28 : 0.12,
  }));
});

// 64px, 2-bit noise. Painted once, unlike a live SVG noise filter.
const GRAIN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAADFBMVEVAQEBwcHCWlpbIyMj5kVXtAAAABHRSTlOAgICAacTQSgAABEtJREFUeNoBQAS/+wChM7UzYPHN4tFwjiMJT8ckANx345kxpzYBRJuUTwwGO5gAlgNXVEYPFxN5nKHhTNmsgwAftisxvJvnyfdod09CxXHOACgo/lwN+EUES1SdEuR0/a8AuzAZtv4CvJiKICyKMfA5/QBamrSCeknMza/E1j9SxdAwAAVgDtT56GLOjN5djI4k0agA+sxtawUlLhBc/1Pgc+EFPgDweMnPAacl2bphsLyS35EmAGU2CvaCFqYG+eG+3ygV9MQAIyMJxuTq0yJhlOMlYIDWGgDTyS7CwJc2nNR8rG31ndMUAM+kPOS0vUoPSTubUx5M5nYAp0RvYkaPPqnX/q1Qbh3dBAAsVk/cN1/8n45tjO0MI2/zADoigxWxajhjLPFIrMOMygQAsNxyTOzEH4/xZoAZs67OdQAfeOmR3MyTfQFv2ReiQa7DAIaQGvgns7+VmD/Z7sVROJsA9zJ41Dzt3Eqp2Csnu4yR3wB8wKFkuVBqpbuBQjPrLJw2AL6rbCtnsUu2gS6lc1xI5xcAJhQHe5pWKU19VzoUKNGUiAAMReQq/BS+sNSjmPjdBNqqAAkRyXcwAmD9LXr1a2ruLxkALjBKL6QjXkkp0VohzBJOaADZvt+p3qpyU3bWRv3fu5EuABV7OiZpbFGl/b3hzVPSrUMAr266NB/IGPSKThRIR51B/gBzp63Dk8gvL7p1CViHjabYAOiwJwO7ROL3xulYoEfuo5wAeZzQ/WP0e4Z32A0mTg9kjwBA/ozmoSSJAY80Z3W4GFVgAG8C+wJ2RunC5jQKt14PAH8A5xCIEYtpCCHSzuUTaDDqbABWIGXyNevckuQkVL93Q1ZYALwjoIECQ2u0Y0hbYs29zbUAP7ikKS5HxfE/fA9T79ugCACsHB62zCl7TjCWn8RralZ6AP0o/sMH+pplT4Sjf3/f2TkAVl05Rfb/Lustj7ahGCYjSwBKXuTncjZ+Rhfu8cKBEN7/AI3xrGeJdJr8XW4OchJHtWIAJeSzHDYcwFqEt4l+LAQJ2ABzdggsJ0q3Q6uHDSeZCgqRABY9h9OoDRqi1E2nyhPwP4kAx6MsVmFnf+3uq6CSTL+HDgAVuA3EyfnSkPA/k6t2QLNlALCMHW3QdHxu2FR+FPCXgoAAIJCbl3671hIcyhXN0jq53gBm1TVanvXVQkjZ11c78G/HANsNSlW75gx+Q+qgHAC8LvQAa7zodaFM3SE3GXyQVoACCQAAsE9MbEhRazrFFk8SegcBAP5cybKrGr5LK2jDaUr0E/AAfOfKah7nsFmKmEUXhB0zuQBlCTCx7P0aZ6TX1MOl8B0BAOWd04Wr6vp9xJ1l1PxKy+YAqMHvOX7t/no9KFL1rMc/LgAcfob8K96LjoqooPfXtIkPAI7U8BaLmqUZJ6F0LxW4R/kAbgNOJvgjY4GFx4jRM6bQhABfTNVVBVE3LP/swoqSWwtEvp77oNyn9N8AAAAASUVORK5CYII=";

function Lines({ lines }: { lines: Line[] }) {
  return lines.map((line) => (
    <path
      key={line.d}
      d={line.d}
      stroke={line.color}
      strokeOpacity={line.opacity}
      strokeWidth={1.2}
      vectorEffect="non-scaling-stroke"
    />
  ));
}

export function HeroField() {
  const { width, height } = HERO_VIEWBOX;
  const viewBox = `0 0 ${width} ${height}`;

  return (
    <div aria-hidden="true" className="lm-hero-field absolute inset-0">
      <HeroGlow />

      {/* "none" stretches the art with the hero, keeping strands on the tiles. */}
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="lm-hero-hole">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.78" stopColor="#000" />
            <stop offset="1" stopColor="#FFF" />
          </radialGradient>
          {/* Fades the lines out before they reach the headline. */}
          <mask
            id="lm-hero-text-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={width}
            height={height}
          >
            <rect width={width} height={height} fill="#FFF" />
            <rect
              x="200"
              y="70"
              width="1040"
              height="720"
              fill="url(#lm-hero-hole)"
            />
          </mask>
        </defs>

        <g fill="none" mask="url(#lm-hero-text-mask)">
          <Lines lines={TRACES} />
          <g className="hidden tablet:inline">
            <Lines lines={HERO_STRANDS} />
          </g>
        </g>
      </svg>

      <HeroComets strands={HERO_STRANDS} viewBox={viewBox} />

      {/* Its own layer, so it also darkens the comets. */}
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="lm-hero-vignette" cy="45%" r="70%">
            <stop offset="0.55" stopColor="#04070C" stopOpacity="0" />
            <stop offset="1" stopColor="#04070C" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#lm-hero-vignette)" />
      </svg>

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: `url("${GRAIN}")` }}
      />
    </div>
  );
}
