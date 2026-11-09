/**
 * Pulls GitHub Releases for lumose-health/lumose at build time and writes
 * src/data/changelog.json with filtered, plain-text entries.
 *
 * Filtering lives in scripts/lib/filter-release-notes.ts. This file only
 * fetches, checks and writes.
 *
 * This never fails the build because of GitHub. If the API can't be reached
 * (rate limit, outage) or returns nothing usable, the existing JSON is kept.
 * With no JSON yet, an empty file is written.
 *
 * Set GITHUB_TOKEN to avoid the 60 requests/hour anonymous limit. Read access
 * to public data is all it needs.
 *
 * `--save-fixture` also writes the raw notes to scripts/fixtures/releases.json,
 * which the filter tests run against.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { BANNED, buildChangelog, REPO, type RawRelease, type Release, type Stats } from "./lib/filter-release-notes";

const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src", "data", "changelog.json");
const FIXTURE_FILE = path.join(ROOT, "scripts", "fixtures", "releases.json");
const MAX_PAGES = 10;
const TIMEOUT_MS = 15_000;

export interface ChangelogData {
  generatedAt: string;
  repo: string;
  releasesUrl: string;
  releases: Release[];
}

export type JsonFetcher = (url: string) => Promise<unknown>;

export class GitHubError extends Error {
  constructor(
    readonly status: number,
    url: string
  ) {
    super(`GitHub ${status} for ${url}`);
  }
}

function ghFetcher(): JsonFetcher {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "lumose-health-website-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  return async (url: string) => {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new GitHubError(res.status, url);
    return res.json();
  };
}

/** Follows page numbers until a short page. /releases honors per_page=100. */
export async function fetchReleases(get: JsonFetcher, repo = REPO): Promise<RawRelease[]> {
  const out: RawRelease[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await get(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error("expected a list of releases");
    out.push(...(batch as RawRelease[]));
    if (batch.length < 100) break;
  }
  return out;
}

/** Only the fields the filter reads, so the saved fixture stays small and free of tokens or URLs we don't use. */
export function trimRelease(r: RawRelease): RawRelease {
  const { tag_name, published_at, created_at, prerelease, draft, body } = r;
  return { tag_name, published_at, created_at, prerelease, draft, body };
}

const emptyData = (): ChangelogData => ({
  generatedAt: new Date().toISOString(),
  repo: REPO,
  releasesUrl: `https://github.com/${REPO}/releases`,
  releases: [],
});

async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

async function readPrevious(file: string): Promise<ChangelogData | null> {
  if (!existsSync(file)) return null;
  try {
    const prev = JSON.parse(await readFile(file, "utf8")) as ChangelogData;
    return Array.isArray(prev?.releases) ? prev : null;
  } catch {
    return null;
  }
}

export async function sync({
  get = ghFetcher(),
  outFile = OUT_FILE,
  fixtureFile = null as string | null,
}: {
  get?: JsonFetcher;
  outFile?: string;
  fixtureFile?: string | null;
} = {}): Promise<{ result: "synced" | "kept" | "empty"; stats?: Stats }> {
  let data: ChangelogData;
  let stats: Stats;
  try {
    const raw = await fetchReleases(get);
    const built = buildChangelog(raw);
    if (built.releases.length === 0) throw new Error("no stable releases returned");
    data = { ...emptyData(), releases: built.releases };
    // Last line of defense: the filter should already have removed these.
    const serialized = JSON.stringify(data);
    if (BANNED.test(serialized)) throw new Error("filtered output still contains a banned word");
    stats = built.stats;
    if (fixtureFile) await writeJson(fixtureFile, raw.map(trimRelease));
  } catch (err) {
    const reason = (err as Error).message;
    const prev = await readPrevious(outFile);
    if (prev) {
      await writeJson(outFile, prev);
      console.warn(`releases: sync failed (${reason}); keeping data from ${prev.generatedAt}`);
      return { result: "kept" };
    }
    console.warn(`releases: sync failed (${reason}); writing empty data`);
    await writeJson(outFile, emptyData());
    return { result: "empty" };
  }

  await writeJson(outFile, data);
  const pct = stats.linesIn ? ((100 * stats.linesKept) / stats.linesIn).toFixed(1) : "0";
  console.log(
    `releases: ${stats.releasesOut} of ${stats.releasesIn} releases, ${stats.linesKept} of ${stats.linesIn} lines kept ` +
      `(${pct}%), ${stats.maintenance} maintenance -> ${path.relative(ROOT, outFile)}`
  );
  return { result: "synced", stats };
}

if (require.main === module) {
  sync({ fixtureFile: process.argv.includes("--save-fixture") ? FIXTURE_FILE : null }).catch((err) => {
    // Only local file errors reach here; GitHub failures are handled in sync().
    console.error(err);
    process.exit(1);
  });
}
