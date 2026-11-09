import { Reveal } from "@/components/reveal";
import json from "@/data/contributors.json";
import { routes } from "@/lib/v2/routes";
import { EXTERNAL_LINK, FOCUS_RING } from "./button";
import { ContributorAvatar } from "./contributor-avatar";
import type { AvatarPerson } from "./contributor-avatar";
import { CountUp } from "./count-up";

const CONTRIBUTE_URL =
  "https://github.com/lumose-health/lumose/blob/main/CONTRIBUTING.md";
// All 48 from 760px up, the first 20 below. Everyone else goes into "+N".
const MAX_WIDE = 48;
const MAX_NARROW = 20;

// The sync writes nothing else, but this file is generated, so anything that
// doesn't look like what it writes is dropped rather than rendered: no remote
// avatar ever reaches a visitor's browser, and links only go to GitHub profiles.
const AVATAR_PATH = /^\/avatars\/[a-z0-9-]+\.(?:png|jpg|gif|webp)$/;
const PROFILE_URL = /^https:\/\/github\.com\/[A-Za-z0-9-]+$/;

// Typed by hand: the sync writes an empty list when GitHub fails on a fresh
// checkout, and the inferred type of an empty list would break the build.
type ContributorsData = {
  generatedAt: string;
  stars: number;
  forks: number;
  latestRelease: string | null;
  contributors: AvatarPerson[];
};
const data: ContributorsData = json;

const people: AvatarPerson[] = data.contributors
  .filter((c) => PROFILE_URL.test(c.profileUrl))
  .map((c) => ({
    login: c.login,
    profileUrl: c.profileUrl,
    commits: c.commits,
    avatar: c.avatar && AVATAR_PATH.test(c.avatar) ? c.avatar : null,
  }));

/** The header reads these too, so its star count and Community link hide along with this section. */
export const hasContributors = people.length > 0;
export const starCount = hasContributors ? data.stars : undefined;

// UTC on both server and client, so the date can't change between them.
const syncedOn = new Date(data.generatedAt).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const STAT = "min-w-0 border-l border-lm-line px-4 py-1 tablet:px-6";
const STAT_LABEL = "text-sm whitespace-nowrap text-lm-ink-muted";
const STAT_VALUE =
  "mt-1.5 font-lm-mono text-2xl/[1.2] font-bold whitespace-nowrap text-lm-ink";

function PlusTile({ count, className }: { count: number; className: string }) {
  return (
    <li
      className={`size-12 items-center justify-center rounded-full border border-lm-line bg-lm-raised font-lm-mono text-[13px] font-medium text-lm-ink-secondary tabular-nums ${className}`}
    >
      <span aria-hidden="true">{`+${count}`}</span>
      <span className="sr-only">{`and ${count} more contributors`}</span>
    </li>
  );
}

export function Contributors() {
  if (!hasContributors) return null;

  const shown = people.slice(0, MAX_WIDE);
  const moreWide = people.length - shown.length;
  const moreNarrow = people.length - Math.min(people.length, MAX_NARROW);

  const stats = [
    { label: "Contributors", value: people.length },
    { label: "GitHub stars", value: data.stars },
    { label: "Forks", value: data.forks },
  ];

  return (
    <section id="contributors" className="border-t border-lm-line-subtle">
      <div className="mx-auto max-w-lm-content px-lm-gutter py-[72px] tablet:py-[96px] desktop:py-[112px]">
        <div className="flex flex-col gap-10 desktop:flex-row desktop:items-end desktop:justify-between">
          <Reveal className="max-w-[560px]">
            <h2 className="mb-3.5 font-lm-display text-lm-h2-compact text-balance">
              Built in the open.
            </h2>
            <p className="text-lm-lead text-lm-ink-muted">
              Code, device drivers, design and testing from people across the
              diabetes community.
            </p>
          </Reveal>

          <dl className="grid grid-cols-2 gap-y-6 tablet:flex tablet:gap-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className={STAT}>
                <dt className={STAT_LABEL}>{stat.label}</dt>
                <dd className={STAT_VALUE}>
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
            {data.latestRelease && (
              <div className={STAT}>
                <dt className={STAT_LABEL}>Latest release</dt>
                <dd className={STAT_VALUE}>
                  <a
                    href={routes.changelog}
                    // The negative margin keeps the 44px target without pushing the value below its neighbours.
                    className={`-mx-1 -my-2 inline-flex min-h-lm-touch items-center rounded-lm-sm px-1 underline decoration-lm-line-strong underline-offset-4 transition-colors duration-(--lm-dur-instant) hover:decoration-lm-ink-faint ${FOCUS_RING}`}
                  >
                    {data.latestRelease}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <Reveal
          delay={100}
          className="group/panel mt-12 rounded-lm-card border border-lm-line bg-lm-card"
        >
          {/* Clipped sideways only, so tooltips can't widen the page but can still drop below a row. */}
          <div data-avatar-panel className="overflow-x-clip">
            {/* The role keeps list semantics in Safari, which drops them when list markers are removed. */}
            <ul
              role="list"
              aria-label="Contributors"
              className="flex flex-wrap gap-3 p-6 tablet:p-8"
            >
              {shown.map((person, index) => (
                <ContributorAvatar
                  key={person.login}
                  person={person}
                  index={index}
                  wideOnly={index >= MAX_NARROW}
                />
              ))}
              {moreNarrow > 0 && (
                <PlusTile count={moreNarrow} className="flex tablet:hidden" />
              )}
              {moreWide > 0 && (
                <PlusTile count={moreWide} className="hidden tablet:flex" />
              )}
            </ul>
          </div>
          <div className="flex flex-col gap-1 border-t border-lm-line px-6 py-2 text-sm text-lm-ink-muted tablet:flex-row tablet:items-center tablet:justify-between tablet:px-8">
            <p className="py-2.5">
              {"Synced from GitHub on "}
              <time dateTime={data.generatedAt}>{syncedOn}</time>.
            </p>
            <a
              href={CONTRIBUTE_URL}
              {...EXTERNAL_LINK}
              className={`-mx-1 inline-flex min-h-lm-touch items-center gap-1.5 self-start rounded-lm-sm px-1 font-medium text-lm-ink transition-colors duration-(--lm-dur-instant) hover:text-lm-ink-secondary tablet:self-auto ${FOCUS_RING}`}
            >
              Start contributing
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
