/**
 * Pulls contributor and repo stats for the org's public repos at build time.
 *
 * - Lists the org's public, non-archived, non-fork repos
 * - Merges each repo's contributor list by GitHub login and sums commit counts
 * - Drops bots (type "Bot", "[bot]" logins, and the EXCLUDE list)
 * - Downloads the top avatars into public/avatars/ so visitors' browsers never
 *   call GitHub, and writes src/data/contributors.json with local paths only
 *
 * This never fails the build because of GitHub. If the API can't be reached
 * (rate limit, outage), the existing JSON is kept. With no JSON yet, an empty
 * file is written. A failed avatar download leaves that person without one.
 *
 * Set GITHUB_TOKEN to avoid the 60 requests/hour anonymous limit.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ORG = process.env.CONTRIBUTORS_ORG ?? "lumose-health";
const MAIN_REPO = process.env.CONTRIBUTORS_MAIN_REPO ?? "lumose";
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src", "data", "contributors.json");
const AVATAR_DIR = path.join(ROOT, "public", "avatars");

export const MAX_AVATARS = 48;
const AVATAR_SIZE = 96;
const AVATAR_HOST = "avatars.githubusercontent.com";
const MAX_AVATAR_BYTES = 256 * 1024;
const AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};
const MAX_PAGES = 10;
const TIMEOUT_MS = 15_000;

// Accounts that aren't people but don't carry GitHub's "Bot" type.
const EXCLUDE = new Set([
  "claude",
  "coderabbitai",
  "devin-ai-integration",
  "copilot",
  "web-flow",
  "actions-user",
]);

// GitHub logins: alphanumerics and single inner hyphens, at most 39 characters.
const LOGIN_RE = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i;

export interface Contributor {
  login: string;
  /** Site-relative path under /avatars/, or null when no avatar was saved. */
  avatar: string | null;
  profileUrl: string;
  commits: number;
  repos: string[];
}

export interface ContributorsData {
  generatedAt: string;
  org: string;
  stars: number;
  forks: number;
  latestRelease: string | null;
  contributors: Contributor[];
}

interface GhRepo {
  name: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  forks_count: number;
}

interface GhContributor {
  login?: string;
  type?: string;
  avatar_url?: string;
  contributions: number;
}

/** Collected people, still carrying the remote avatar URL to download from. */
export interface CollectedContributor extends Omit<Contributor, "avatar"> {
  remoteAvatar: string | undefined;
}

export type JsonFetcher = (url: string) => Promise<unknown>;
export type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;

function ghFetcher(fetchImpl: FetchImpl = fetch): JsonFetcher {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": `${ORG}-website-build`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  return async (url: string) => {
    const res = await fetchImpl(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    // /contributors answers 204 for an empty repo.
    if (res.status === 204) return [];
    if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
    return res.json();
  };
}

/** Follows page numbers until a short page. Both endpoints used here honor per_page=100. */
async function paged<T>(get: JsonFetcher, url: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = url.includes("?") ? "&" : "?";
    const batch = await get(`${url}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`expected a list from ${url}`);
    out.push(...(batch as T[]));
    if (batch.length < 100) break;
  }
  return out;
}

/** Returns the login lowercased when it is a valid GitHub login, so it is safe as a file name. */
export function safeLogin(login: unknown): string | null {
  return typeof login === "string" && LOGIN_RE.test(login) ? login.toLowerCase() : null;
}

export function isHuman(c: GhContributor): c is GhContributor & { login: string } {
  if (c.type === "Bot") return false;
  const l = safeLogin(c.login);
  return l !== null && !EXCLUDE.has(l);
}

export async function collect(
  get: JsonFetcher,
  org = ORG,
  mainRepo = MAIN_REPO
): Promise<Omit<ContributorsData, "contributors"> & { contributors: CollectedContributor[] }> {
  const repos = (await paged<GhRepo>(get, `https://api.github.com/orgs/${org}/repos?type=public`)).filter(
    (r) => !r.private && !r.fork && !r.archived
  );

  const byLogin = new Map<string, CollectedContributor>();
  for (const repo of repos) {
    const list = await paged<GhContributor>(
      get,
      `https://api.github.com/repos/${org}/${encodeURIComponent(repo.name)}/contributors`
    );
    for (const c of list.filter(isHuman)) {
      const key = c.login.toLowerCase();
      const cur = byLogin.get(key) ?? {
        login: c.login,
        remoteAvatar: c.avatar_url,
        profileUrl: `https://github.com/${c.login}`,
        commits: 0,
        repos: [],
      };
      cur.commits += c.contributions;
      cur.repos.push(repo.name);
      byLogin.set(key, cur);
    }
  }

  let latestRelease: string | null = null;
  try {
    const rel = (await get(`https://api.github.com/repos/${org}/${mainRepo}/releases/latest`)) as {
      tag_name?: string;
    };
    latestRelease = rel.tag_name ?? null;
  } catch {
    // 404 when the repo has no release yet.
    latestRelease = null;
  }

  const main = repos.find((r) => r.name.toLowerCase() === mainRepo.toLowerCase());
  return {
    generatedAt: new Date().toISOString(),
    org,
    stars: main?.stargazers_count ?? repos.reduce((n, r) => n + r.stargazers_count, 0),
    forks: main?.forks_count ?? repos.reduce((n, r) => n + r.forks_count, 0),
    latestRelease,
    contributors: [...byLogin.values()].sort((a, b) => b.commits - a.commits || a.login.localeCompare(b.login)),
  };
}

/** Reads a response body, giving up once it passes the byte limit. */
async function readCapped(res: Response, limit: number): Promise<Uint8Array | null> {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

/** Downloads one avatar into dir and returns its site path, or null on any problem. */
export async function downloadAvatar(
  login: string,
  remote: string | undefined,
  dir: string,
  fetchImpl: FetchImpl = fetch
): Promise<string | null> {
  const name = safeLogin(login);
  if (!name || !remote) return null;

  let url: URL;
  try {
    url = new URL(remote);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname !== AVATAR_HOST || url.port !== "") return null;
  url.searchParams.set("s", String(AVATAR_SIZE));

  try {
    // No token here, and no redirects, so the request can't leave the avatar host.
    const res = await fetchImpl(url.toString(), { redirect: "error", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const ext = AVATAR_TYPES[(res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase()];
    if (!ext) return null;
    const declared = Number(res.headers.get("content-length") ?? "0");
    if (declared > MAX_AVATAR_BYTES) return null;
    const bytes = await readCapped(res, MAX_AVATAR_BYTES);
    if (!bytes || bytes.byteLength === 0) return null;

    const file = path.join(dir, `${name}.${ext}`);
    if (path.resolve(path.dirname(file)) !== path.resolve(dir)) return null;
    await writeFile(file, bytes);
    return `/avatars/${name}.${ext}`;
  } catch {
    return null;
  }
}

/** Replaces avatars/ with fresh downloads for the first MAX_AVATARS people. */
export async function saveAvatars(
  people: CollectedContributor[],
  dir: string,
  fetchImpl: FetchImpl = fetch
): Promise<Contributor[]> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const out: Contributor[] = [];
  for (const [i, { remoteAvatar, ...rest }] of people.entries()) {
    const avatar = i < MAX_AVATARS ? await downloadAvatar(rest.login, remoteAvatar, dir, fetchImpl) : null;
    out.push({ ...rest, avatar });
  }
  return out;
}

async function writeJson(file: string, data: ContributorsData) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

async function readPrevious(file: string): Promise<ContributorsData | null> {
  if (!existsSync(file)) return null;
  try {
    const prev = JSON.parse(await readFile(file, "utf8")) as ContributorsData;
    return Array.isArray(prev?.contributors) ? prev : null;
  } catch {
    return null;
  }
}

export async function sync({
  get = ghFetcher(),
  fetchImpl = fetch as FetchImpl,
  outFile = OUT_FILE,
  avatarDir = AVATAR_DIR,
  publicDir = path.dirname(avatarDir),
}: {
  get?: JsonFetcher;
  fetchImpl?: FetchImpl;
  outFile?: string;
  avatarDir?: string;
  publicDir?: string;
} = {}): Promise<"synced" | "kept" | "empty"> {
  let collected: Awaited<ReturnType<typeof collect>>;
  try {
    collected = await collect(get);
    if (collected.contributors.length === 0) throw new Error("no contributors returned");
  } catch (err) {
    const reason = (err as Error).message;
    const prev = await readPrevious(outFile);
    if (prev) {
      // Kept data may point at avatars that aren't on disk in a fresh checkout.
      for (const c of prev.contributors) {
        if (c.avatar && !existsSync(path.join(publicDir, c.avatar))) c.avatar = null;
      }
      await writeJson(outFile, prev);
      console.warn(`contributors: sync failed (${reason}); keeping data from ${prev.generatedAt}`);
      return "kept";
    }
    console.warn(`contributors: sync failed (${reason}); writing empty data`);
    await writeJson(outFile, {
      generatedAt: new Date().toISOString(),
      org: ORG,
      stars: 0,
      forks: 0,
      latestRelease: null,
      contributors: [],
    });
    return "empty";
  }

  const contributors = await saveAvatars(collected.contributors, avatarDir, fetchImpl);
  await writeJson(outFile, { ...collected, contributors });
  const saved = contributors.filter((c) => c.avatar).length;
  console.log(
    `contributors: ${contributors.length} people, ${saved} avatars, ${collected.stars} stars, ` +
      `release ${collected.latestRelease ?? "none"} -> ${path.relative(ROOT, outFile)}`
  );
  return "synced";
}

if (require.main === module) {
  sync().catch((err) => {
    // Only local file errors reach here; GitHub failures are handled in sync().
    console.error(err);
    process.exit(1);
  });
}
