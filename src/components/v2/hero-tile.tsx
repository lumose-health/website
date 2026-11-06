import { flags } from "@/data/flags";
import { HeroTileItem } from "./hero-comets";
import { HERO_VIEWBOX } from "./hero-field";
import type { HeroSource } from "./hero-field";

function percent(value: number, total: number) {
  return `${((value / total) * 100).toFixed(2)}%`;
}

export function HeroTile({ name, index, x, y, logo }: HeroSource) {
  const image = flags.logosCleared ? logo : undefined;

  return (
    // Placed by percentage so a tile stays on its strands, which stretch with
    // the hero.
    <HeroTileItem
      index={index}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
      style={{
        left: percent(x, HERO_VIEWBOX.width),
        top: percent(y, HERO_VIEWBOX.height),
      }}
    >
      {/* The pulse is on a wrapper because a child can't paint behind the tile. */}
      <div className="lm-hero-ring relative size-[54px]">
        <div className="relative flex size-full items-center justify-center rounded-lm-tile border border-lm-cyan/28 bg-[rgba(8,14,24,0.72)] backdrop-blur-[6px]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export, and the name is in the caption
            <img
              src={image}
              alt=""
              width={30}
              height={30}
              loading="lazy"
              decoding="async"
              className="size-[30px] rounded-lm-sm object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="font-lm-mono text-[22px] leading-none font-medium text-lm-ink-secondary"
            >
              {name[0]}
            </span>
          )}
        </div>
      </div>
      <span className="font-lm-mono text-[10px] tracking-[0.12em] text-[rgba(200,220,240,0.75)] uppercase">
        {name}
      </span>
    </HeroTileItem>
  );
}
