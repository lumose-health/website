import { ArrowRight } from "lucide-react";
import { flags } from "@/data/flags";
import { routes } from "@/lib/v2/routes";
import { ButtonLink } from "./button";
import { HERO_SOURCES, HeroField } from "./hero-field";
import { HeroTile } from "./hero-tile";
import { MarksNotice } from "./marks-notice";
import { RenamePill } from "./rename-pill";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-lm-hero desktop:min-h-[860px]">
      <HeroField />

      <div className="relative z-10 mx-auto max-w-[900px] px-lm-gutter pt-[72px] pb-[120px] text-center tablet:pt-[112px] tablet:pb-[170px] desktop:pt-[140px] desktop:pb-[280px]">
        {flags.showRename && <RenamePill />}

        <h1 className="mb-[26px] font-lm-display text-lm-hero-title [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]">
          The <span className="whitespace-nowrap">open-source</span>{" "}
          <span className="bg-linear-to-b from-lm-headline-from to-lm-headline-to bg-clip-text text-transparent">
            AI brain
          </span>{" "}
          for diabetes.
        </h1>

        <p className="mx-auto mb-[34px] max-w-[620px] text-lm-lead text-[rgba(236,242,250,0.88)] [text-shadow:0_2px_20px_rgb(0_0_0/0.7)] tablet:max-w-[480px] desktop:max-w-[620px]">
          Lumose plugs into your CGM, your pump, Nightscout and the apps you
          already run, then turns that data into answers and daily briefs. On
          your server, with the AI you choose.
        </p>

        <div className="mb-[26px] flex flex-wrap justify-center gap-3">
          <ButtonLink
            variant="hero-light"
            href={`${routes.home}#start`}
            className="gap-2"
          >
            Get started <ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            variant="ghost"
            href={`${routes.home}#demo`}
            className="bg-[rgba(10,16,26,0.45)] backdrop-blur-[8px]"
          >
            Watch it live
          </ButtonLink>
        </div>

        <p className="font-lm-mono text-[13px] text-balance text-[rgba(200,214,230,0.7)]">
          Because no one should manage diabetes alone.
        </p>
        <MarksNotice className="mt-2 hidden tablet:block" />
      </div>

      {/* After the copy, so screen readers reach the headline first. */}
      <ul className="absolute inset-0 hidden tablet:block">
        {HERO_SOURCES.map((source) => (
          <HeroTile key={source.name} {...source} />
        ))}
      </ul>
    </section>
  );
}
