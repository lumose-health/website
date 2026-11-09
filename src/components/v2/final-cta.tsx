import { Reveal } from "@/components/reveal";
import { GITHUB_URL } from "@/lib/v2/routes";
import { ButtonLink, EXTERNAL_LINK } from "./button";

// The page ends still on purpose: the panel reveals once and nothing else moves.
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="mx-auto max-w-lm-content px-lm-gutter pb-[72px] tablet:pb-[96px] desktop:pb-[112px]"
    >
      <Reveal className="rounded-lm-cta border border-lm-line-accent bg-lm-cta px-6 py-12 text-center tablet:px-8 tablet:py-16">
        <h2
          id="final-cta-title"
          className="mb-3.5 font-lm-display text-lm-h2-compact text-balance"
        >
          Run it yourself tonight
        </h2>
        <p className="mx-auto mb-7 max-w-[520px] text-lm-lead text-lm-ink-muted">
          Free, open source and yours. Bring your devices and an AI provider
          you already use.
        </p>
        <div className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:justify-center">
          <ButtonLink href="#start" className="min-h-12! px-[22px]!">
            Get started
          </ButtonLink>
          <ButtonLink
            variant="ghost"
            href={GITHUB_URL}
            {...EXTERNAL_LINK}
            className="min-h-12! px-[22px]!"
          >
            View on GitHub
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
