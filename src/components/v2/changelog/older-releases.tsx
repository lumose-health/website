import { ChevronDown } from "lucide-react";
import { FOCUS_RING } from "../button";
import { Release, type ChangelogRelease } from "./release";

export const OLDER_ID = "older";

/** "v0.13.2" belongs to "v0.13". Anything that isn't a version gets its own row. */
function minorOf(version: string): string {
  const m = /^v?(\d+)\.(\d+)/.exec(version);
  return m ? `v${m[1]}.${m[2]}` : version;
}

function groupByMinor(releases: readonly ChangelogRelease[]) {
  const groups: { minor: string; releases: ChangelogRelease[] }[] = [];
  for (const release of releases) {
    const minor = minorOf(release.version);
    const last = groups.at(-1);
    if (last && last.minor === minor) last.releases.push(release);
    else groups.push({ minor, releases: [release] });
  }
  return groups;
}

/**
 * Releases past the latest few, one native <details> row per minor version,
 * so they open without JS and the page stays short until someone asks.
 */
export function OlderReleases({ releases }: { releases: readonly ChangelogRelease[] }) {
  if (releases.length === 0) return null;
  const groups = groupByMinor(releases);

  return (
    <section aria-labelledby={OLDER_ID} className="mt-14">
      <h2
        id={OLDER_ID}
        tabIndex={-1}
        className={`scroll-mt-6 rounded-lm-sm font-lm-display text-[22px]/[1.25] font-medium ${FOCUS_RING}`}
      >
        Older releases
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        {groups.map((group) => (
          <details
            key={group.minor}
            className="group/older rounded-lm-card border border-lm-line bg-lm-card"
          >
            <summary
              className={`flex min-h-lm-touch cursor-pointer list-none items-center gap-3 rounded-lm-card px-5 py-3 transition-colors duration-(--lm-dur-instant) hover:bg-lm-raised [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}
            >
              <h3 className="font-lm-mono text-base font-bold">{group.minor}</h3>
              <span className="text-sm text-lm-ink-faint">
                {group.releases.length === 1 ? "1 release" : `${group.releases.length} releases`}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="ml-auto size-5 shrink-0 text-lm-ink-muted group-open/older:rotate-180"
              />
            </summary>
            <div className="divide-y divide-lm-line-subtle border-t border-lm-line px-5 pt-8 pb-6">
              {group.releases.map((release) => (
                <Release key={release.anchor} release={release} level={4} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
