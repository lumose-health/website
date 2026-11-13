import type { Metadata } from "next";
import json from "@/data/changelog.json";
import { GITHUB_URL } from "@/lib/v2/routes";
import { Card } from "@/components/v2/card";
import { EXTERNAL_LINK } from "@/components/v2/button";
import { ContentRail, type RailItem } from "@/components/v2/content-rail";
import { ContentShell } from "@/components/v2/content-shell";
import { OLDER_ID, OlderReleases } from "@/components/v2/changelog/older-releases";
import {
  Release,
  TEXT_LINK,
  formatDate,
  type ChangelogEntry,
  type ChangelogRelease,
} from "@/components/v2/changelog/release";

// noindex comes from the v2 layout. Only the title is set here.
export const metadata: Metadata = {
  title: "Changelog | Lumose",
};

const OPEN_COUNT = 10;
const RELEASES_URL = `${GITHUB_URL}/releases`;

// Typed by hand: the sync writes an empty list when GitHub fails on a fresh
// checkout, and the inferred type of an empty list would break the build.
type RawEntry = {
  text: string;
  area: string | null;
  pr: { number: number; url: string } | null;
  inDevelopment: boolean;
};
type RawRelease = {
  version: string;
  date: string;
  url: string;
  maintenance: boolean;
  new: RawEntry[];
  fixed: RawEntry[];
  breaking: RawEntry[];
};
type ChangelogData = { generatedAt: string; releases: RawRelease[] };
const data: ChangelogData = json;

// The sync builds every link from the repo name, but this file is generated,
// so a link that doesn't look like one it writes is left out, not followed.
const RELEASE_URL = /^https:\/\/github\.com\/lumose-health\/lumose\/releases\/tag\/[A-Za-z0-9._%-]+$/;
const PR_URL = /^https:\/\/github\.com\/lumose-health\/lumose\/pull\/(\d+)$/;

/** "v0.16.0" becomes "v0-16-0". */
function anchorOf(version: string): string {
  const slug = version.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return /^v/.test(slug) ? slug : `v${slug}`;
}

function cleanEntry(e: RawEntry): ChangelogEntry {
  const pr = e.pr && PR_URL.exec(e.pr.url);
  return {
    text: String(e.text),
    area: e.area ? String(e.area) : null,
    prUrl: pr ? pr[0] : null,
    prNumber: pr ? Number(pr[1]) : null,
    inDevelopment: e.inDevelopment === true,
  };
}

const seen = new Set<string>();
const releases: ChangelogRelease[] = (Array.isArray(data.releases) ? data.releases : [])
  .filter((r) => typeof r?.version === "string" && r.version.length > 0)
  .map((r) => ({
    version: r.version,
    anchor: anchorOf(r.version),
    date: typeof r.date === "string" ? r.date : "",
    url: RELEASE_URL.test(r.url) ? r.url : null,
    maintenance: r.maintenance === true,
    new: (r.new ?? []).map(cleanEntry),
    fixed: (r.fixed ?? []).map(cleanEntry),
    breaking: (r.breaking ?? []).map(cleanEntry),
  }))
  // Two tags that slug alike would share an anchor. Keep the newest.
  .filter((r) => !seen.has(r.anchor) && seen.add(r.anchor));

const latest = releases.slice(0, OPEN_COUNT);
const older = releases.slice(OPEN_COUNT);
const syncedOn = formatDate(data.generatedAt);

const railItems: RailItem[] = [
  ...latest.map((r) => ({ id: r.anchor, label: r.version })),
  ...(older.length > 0 ? [{ id: OLDER_ID, label: "Older" }] : []),
];

export default function ChangelogPage() {
  const empty = releases.length === 0;

  return (
    <ContentShell
      title="Changelog"
      lead="What changed in each Lumose release, newest first."
      rail={empty ? undefined : <ContentRail label="Releases" items={railItems} />}
    >
      {empty ? (
        <Card>
          <p className="text-lm-ink-muted">
            Release notes aren&rsquo;t available in this build.
          </p>
          <p className="mt-3">
            <a
              href={RELEASES_URL}
              {...EXTERNAL_LINK}
              className={`-my-2.5 inline-flex min-h-lm-touch items-center ${TEXT_LINK}`}
            >
              See releases on GitHub
              <span aria-hidden="true">&nbsp;→</span>
            </a>
          </p>
        </Card>
      ) : (
        <>
          <div className="divide-y divide-lm-line-subtle">
            {latest.map((release) => (
              <Release key={release.anchor} release={release} />
            ))}
          </div>
          <OlderReleases releases={older} />
          {syncedOn && (
            <p className="mt-14 border-t border-lm-line-subtle pt-6 text-sm text-lm-ink-faint">
              Synced from GitHub on {syncedOn}.
            </p>
          )}
        </>
      )}
    </ContentShell>
  );
}
