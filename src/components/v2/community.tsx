import { Reveal } from "@/components/reveal";
import { routes } from "@/lib/v2/routes";
import { EXTERNAL_LINK, FOCUS_RING } from "./button";
import { LinkCard } from "./card";
import { SPONSOR_URL } from "./header";

const DISCORD_URL = "https://discord.gg/QbyhCQKDBs";

// From SPONSORS.md in lumose-health/.github: two in-kind programs and the
// fiscal host. Each links to the program Lumose is part of, not a home page.
const SUPPORTERS = [
  {
    name: "1Password",
    href: "https://github.com/1Password/for-open-source",
    logo: "/sponsors/1password-dark.svg",
    width: 24,
    height: 24,
  },
  {
    name: "Sentry",
    href: "https://sentry.io/for/good/",
    logo: "/sponsors/sentry-dark.svg",
    width: 24,
    height: 24,
  },
  {
    name: "Open Source Collective",
    href: "https://oscollective.org/",
    logo: "/sponsors/osc-white.png",
    width: 41,
    height: 20,
  },
];

export function Community() {
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="mx-auto max-w-lm-content px-lm-gutter pt-[72px] pb-[72px] tablet:pt-[96px] desktop:pt-[112px] desktop:pb-[96px]"
    >
      <h2 id="community-title" className="sr-only">
        Docs, community and support
      </h2>

      <ul role="list" className="grid grid-cols-1 gap-4 desktop:grid-cols-3">
        <li>
          <Reveal className="h-full">
            <LinkCard title="Docs" action="Browse the docs" href={routes.docs}>
              Install, daily use, caregivers, Android and developer guides,
              synced from GitHub on each build.
            </LinkCard>
          </Reveal>
        </li>
        <li>
          <Reveal delay={100} className="h-full">
            <LinkCard
              title="Community"
              action="Join the Discord"
              href={DISCORD_URL}
              {...EXTERNAL_LINK}
            >
              Developers, designers and people living with diabetes. Join the
              Discord or GitHub Discussions. No CLA.
            </LinkCard>
          </Reveal>
        </li>
        <li>
          <Reveal delay={200} className="h-full">
            <LinkCard
              title="Support the project"
              action="Open Collective"
              href={SPONSOR_URL}
              {...EXTERNAL_LINK}
            >
              Fiscally hosted by Open Source Collective. Every expense is
              public.
            </LinkCard>
          </Reveal>
        </li>
      </ul>

      <div className="mt-16 flex flex-col items-center gap-3 tablet:mt-20 tablet:flex-row tablet:justify-center tablet:gap-10">
        <p
          id="supported-by"
          className="font-lm-mono text-xs tracking-[0.06em] text-lm-ink-faint uppercase"
        >
          Supported by
        </p>
        <ul
          role="list"
          aria-labelledby="supported-by"
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 tablet:gap-x-10"
        >
          {SUPPORTERS.map((supporter) => (
            <li key={supporter.name}>
              <a
                href={supporter.href}
                {...EXTERNAL_LINK}
                className={`inline-flex min-h-lm-touch items-center gap-2.5 rounded-lm-sm px-1 font-lm-display text-[17px] font-medium text-lm-ink-secondary underline-offset-4 hover:underline ${FOCUS_RING}`}
              >
                {/* A light system canvas would hide these white marks, so forced
                    colors gets a dark plate behind each one. */}
                <span className="inline-flex shrink-0 forced-colors:rounded-[4px] forced-colors:bg-lm-page forced-colors:p-1 forced-colors:forced-color-adjust-none">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, and the visible name labels the link */}
                  <img
                    src={supporter.logo}
                    alt=""
                    width={supporter.width}
                    height={supporter.height}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                {supporter.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
