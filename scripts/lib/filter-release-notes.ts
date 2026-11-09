/**
 * Turns raw GitHub release notes into plain, structured changelog entries.
 *
 * Pure: no I/O, so it can be tested against saved real notes. Output strings
 * are plain text with markdown and HTML removed, and every URL is built here
 * from a PR number or tag, never copied from the notes.
 *
 * The notes come in three shapes over the project's history:
 * - `### <Area>` then `#### <Type>` then `- type(scope): text [@author](…) ([#n](…))`
 * - the same with nested `  - #### <Type>` and `    - item` lines
 * - release-please: `### <Type>` then `* **scope:** text ([#n](…)) ([sha](…))`
 */

export const REPO = "lumose-health/lumose";
const REPO_URL = `https://github.com/${REPO}`;

export type Group = "new" | "fixed" | "breaking";

export interface Entry {
  text: string;
  /** Product area from the notes, such as "API" or "Mobile". Null when the notes don't say. */
  area: string | null;
  pr: { number: number; url: string } | null;
  /** Alerting is in development, so these lines carry the in-development pill. */
  inDevelopment: boolean;
}

export interface Release {
  version: string;
  /** YYYY-MM-DD, from the release's publish date. */
  date: string;
  url: string;
  /** True when filtering left nothing, so the page shows "Maintenance release.". */
  maintenance: boolean;
  new: Entry[];
  fixed: Entry[];
  breaking: Entry[];
}

export interface RawRelease {
  tag_name?: unknown;
  published_at?: unknown;
  created_at?: unknown;
  prerelease?: unknown;
  draft?: unknown;
  body?: unknown;
}

export type DropReason =
  | "other-changes"
  | "container-images"
  | "bot"
  | "sync-release"
  | "chore"
  | "dependency"
  | "banned"
  | "no-group"
  | "empty"
  | "duplicate";

export interface LineResult {
  raw: string;
  kept: Entry & { group: Group } | null;
  reason: DropReason | null;
}

/** Words that must never reach the site. Kept in step with scripts/check-v2.sh. */
export const BANNED = /telegram|predict|push notif|fcm|apns|alarm|always fires|never waits/i;
const IN_DEVELOPMENT = /alert|escalat/i;

const TYPE_HEADINGS: Record<string, Group | null> = {
  features: "new",
  "new features": "new",
  "bug fixes": "fixed",
  "breaking changes": "breaking",
  // release-please and labeler sections that aren't product changes
  "other changes": null,
  "code refactoring": null,
  "ci/cd": null,
  "performance improvements": null,
  reverts: null,
  "miscellaneous chores": null,
  "build system": null,
  tests: null,
  styles: null,
};

const BOT_AUTHORS = new Set([
  "glycemicgpt-merge",
  "lumose-merge",
  "renovate",
  "renovate-bot",
  "dependabot",
  "github-actions",
  "coderabbitai",
]);
// Conventional-commit types and scopes that never describe a product change.
const DROP_TYPES = new Set(["chore", "ci", "build", "test", "tests", "style"]);
const DROP_SCOPES = new Set(["ci", "deps", "deps-dev", "release"]);

const SEMVER_TAG = /^v\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const MAX_TEXT = 240;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };

function decodeEntities(s: string): string {
  return s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e: string) => ENTITIES[e]);
}

/** Heading text with emoji, markdown and links removed, lowercased for lookup. */
function headingKey(text: string): string {
  return plain(text).toLowerCase();
}

/** Removes markdown, HTML and anything outside printable text. */
export function plain(s: string): string {
  let out = decodeEntities(s).replace(/\s*-+>\s*/g, " → ");
  // Real HTML tags only, plus an unclosed one at the very end. A lone "<" or ">", as in
  // "glucose < 70", stays as text: the output is rendered as text, never as HTML.
  out = out.replace(/<\/?[a-z][^<>]*>|<\/?[a-z][^<>]*$/gi, " ");
  // Images and links, allowing one level of parentheses inside the URL.
  out = out.replace(/!?\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, "$1");
  out = out.replace(/\bhttps?:\/\/\S+/gi, " "); // bare URLs
  out = out.replace(/[*~`]+/g, ""); // emphasis and code marks
  out = out.replace(/(?<![A-Za-z0-9])_+|_+(?![A-Za-z0-9])/g, ""); // underscores, but not inside snake_case
  out = out.replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|[\uFE0F\u200D]/gu, "");
  out = out.replace(/[\p{Cc}\p{Cf}]/gu, " ");
  return out.replace(/\s+/g, " ").trim();
}

/** "Wear OS", "API" and similar. Anything odd-looking is dropped rather than shown. */
function cleanArea(text: string): string | null {
  const a = plain(text);
  if (/^uncategori[sz]ed$/i.test(a) || BANNED.test(a)) return null;
  return /^[A-Za-z][A-Za-z0-9 /&.-]{0,29}$/.test(a) ? a : null;
}

// Internal planning references, as prefixes or parentheticals.
const REF_PREFIX = /^(?:(?:epic|stor(?:y|ies)|phase|milestone)\s+[\w.+\-–, ]*?\s*(?:--|—|–|:)\s*)+/i;
const REF_PAREN = /\s*\((?:[^()]*\b(?:epic|stor(?:y|ies)|milestone|phase)\b[^()]*)\)/gi;
const LEADING_EPIC = /^epic\s+\d+\s+/i;
// Issue and tracker numbers: "(#1025)", "(closes #598)", "(43.12 PR 4)", "(43.7d)", "(H1–H3)".
const TRACKER_PAREN = [
  /\s*\((?:(?:closes|fixes|fix|refs?|see)\s+)?#\d+\)/gi,
  /\s*\(\d+\.\d+[a-z]?(?:\s+PR\s+\d+)?\)/gi,
  /\s*\([A-Z]\d+(?:\s*[–-]\s*[A-Z]?\d+)?\)/g,
];

interface Parsed {
  type: string | null;
  scope: string | null;
  breaking: boolean;
  text: string;
  author: string | null;
  pr: number | null;
}

function parseItem(item: string): Parsed {
  let s = item.trim();

  // Trailing links: ([#n](…)), ([sha](…)) and [@author](…), in any order.
  let pr: number | null = null;
  let author: string | null = null;
  for (;;) {
    const m =
      s.match(/\s*\(\[#(\d+)\]\([^)]*\)\)\s*$/) ??
      s.match(/\s*\(\[[0-9a-f]{7,40}\]\([^)]*\)\)\s*$/i) ??
      s.match(/\s*\[@([\w.-]+(?:\[bot\])?)\]\([^)]*\)\s*$/);
    if (!m) break;
    if (m[0].includes("[#")) pr ??= Number(m[1]);
    else if (m[0].includes("[@")) author = m[1].toLowerCase();
    s = s.slice(0, m.index).trimEnd();
  }

  let type: string | null = null;
  let scope: string | null = null;
  let breaking = false;
  const cc = s.match(/^([a-z]+)(?:\(([^)]*)\))?(!)?:(?:\s*\([^)]*\))?\s+/i);
  const rp = s.match(/^\*\*([^*:]+):\*\*\s+/);
  if (cc) {
    type = cc[1].toLowerCase();
    scope = cc[2]?.toLowerCase() ?? null;
    breaking = Boolean(cc[3]);
    s = s.slice(cc[0].length);
  } else if (rp) {
    scope = rp[1].toLowerCase();
    s = s.slice(rp[0].length);
  }
  return { type, scope, breaking, text: s, author, pr };
}

function cleanText(text: string): string {
  let t = plain(text).replace(REF_PAREN, "");
  for (const re of TRACKER_PAREN) t = t.replace(re, "");
  t = t.replace(REF_PREFIX, "").replace(LEADING_EPIC, "").replace(/\s+([.,;:])/g, "$1").trim();
  if (t.length > MAX_TEXT) t = t.slice(0, MAX_TEXT - 1).trimEnd() + "…";
  // Capitalize, but leave identifiers and units such as mmol/L, xDrip+ or ns_emulator alone.
  const first = t.split(" ", 1)[0];
  if (/[_/]|^.+[A-Z]/.test(first)) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function isBot(author: string | null, raw: string): boolean {
  if (author && (BOT_AUTHORS.has(author) || author.endsWith("[bot]") || author.endsWith("-bot"))) return true;
  return /\b(?:renovate|dependabot|coderabbit)\b|^merge (?:pull request|branch)\b/i.test(raw);
}

/**
 * Classifies one bullet. `heading` is the type heading it sits under, if any:
 * a Group, null for a section that is dropped, or undefined when there is none.
 */
export function classifyLine(raw: string, area: string | null, heading: Group | null | undefined): LineResult {
  const drop = (reason: DropReason): LineResult => ({ raw, kept: null, reason });
  if (heading === null) return drop("other-changes");
  // Checked on the raw line so a banned word in a link or scope can't slip through.
  // Also checked after markdown is removed, so "push **notifications**" is caught too.
  if (BANNED.test(decodeEntities(raw)) || BANNED.test(plain(raw))) return drop("banned");

  const p = parseItem(raw);
  if (isBot(p.author, raw)) return drop("bot");
  if (/\bsync (?:release|changelog)\b|\bfrom main to develop\b/i.test(p.text)) return drop("sync-release");
  if (p.scope === "deps" || p.scope === "deps-dev") return drop("dependency");
  if (/\b(?:update|bump)\s+(?:[\w@./:-]+\s+(?:monorepo\s+)?to\s+[v^~]?\d)|\bdependenc(?:y|ies)\b|\block ?file\b/i.test(p.text)) {
    return drop("dependency");
  }
  if ((p.type && DROP_TYPES.has(p.type)) || (p.scope && DROP_SCOPES.has(p.scope))) return drop("chore");

  let group: Group | null = heading ?? null;
  if (heading === undefined) {
    if (p.breaking) group = "breaking";
    else if (p.type === "feat") group = "new";
    else if (p.type === "fix") group = "fixed";
  }
  if (!group) return drop("no-group");

  const text = cleanText(p.text);
  if (text.length < 3) return drop("empty");
  return {
    raw,
    reason: null,
    kept: {
      group,
      text,
      area,
      pr: p.pr && p.pr > 0 ? { number: p.pr, url: `${REPO_URL}/pull/${p.pr}` } : null,
      inDevelopment: IN_DEVELOPMENT.test(text),
    },
  };
}

/** Parses one release body into a line-by-line result list. */
export function filterNotes(body: string): LineResult[] {
  const out: LineResult[] = [];
  let area: string | null = null;
  let heading: Group | null | undefined = undefined;
  let skipping = false;
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h = line.match(/^\s*(?:[-*]\s+)?(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const key = headingKey(h[2]);
      if (level <= 2) {
        // A version heading, or the Container Images block.
        skipping = key.includes("container images");
        area = null;
        heading = undefined;
      } else if (key in TYPE_HEADINGS) {
        heading = TYPE_HEADINGS[key];
      } else if (level === 3) {
        area = cleanArea(h[2]);
        heading = undefined;
      }
      continue;
    }

    const item = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (!item) continue;
    if (skipping) {
      out.push({ raw: item[1], kept: null, reason: "container-images" });
      continue;
    }
    out.push(classifyLine(item[1], area, heading));
  }
  return out;
}

export function isStable(r: RawRelease): r is RawRelease & { tag_name: string } {
  return r.prerelease !== true && r.draft !== true && typeof r.tag_name === "string" && SEMVER_TAG.test(r.tag_name);
}

function compareVersions(a: string, b: string): number {
  const pa = a.slice(1).split(".").map(Number);
  const pb = b.slice(1).split(".").map(Number);
  return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
}

export interface Stats {
  releasesIn: number;
  releasesOut: number;
  maintenance: number;
  linesIn: number;
  linesKept: number;
  dropped: Partial<Record<DropReason, number>>;
}

/** Builds the changelog from raw releases, newest first, with stats for the sync log. */
export function buildChangelog(raw: RawRelease[]): { releases: Release[]; stats: Stats; lines: LineResult[] } {
  const stats: Stats = { releasesIn: raw.length, releasesOut: 0, maintenance: 0, linesIn: 0, linesKept: 0, dropped: {} };
  const all: LineResult[] = [];
  const releases: Release[] = [];

  // Oldest first, so a change listed again in a later release stays with the
  // release that first shipped it.
  const stable = raw.filter(isStable).sort((a, b) => compareVersions(b.tag_name, a.tag_name));
  const shipped = new Set<string>();
  for (const r of stable) {
    const lines = filterNotes(typeof r.body === "string" ? r.body : "");
    const rel: Release = {
      version: r.tag_name,
      date: dateOf(r.published_at) ?? dateOf(r.created_at) ?? "",
      url: `${REPO_URL}/releases/tag/${encodeURIComponent(r.tag_name)}`,
      maintenance: false,
      new: [],
      fixed: [],
      breaking: [],
    };
    for (const l of lines) {
      if (l.kept) {
        const key = l.kept.pr ? `#${l.kept.pr.number}` : l.kept.text.toLowerCase();
        if (shipped.has(key)) {
          l.kept = null;
          l.reason = "duplicate";
        } else {
          shipped.add(key);
          const { group, ...entry } = l.kept;
          rel[group].push(entry);
        }
      }
      stats.linesIn++;
      if (l.kept) stats.linesKept++;
      else if (l.reason) stats.dropped[l.reason] = (stats.dropped[l.reason] ?? 0) + 1;
      all.push(l);
    }
    rel.maintenance = rel.new.length + rel.fixed.length + rel.breaking.length === 0;
    if (rel.maintenance) stats.maintenance++;
    releases.push(rel);
  }

  releases.reverse();
  stats.releasesOut = releases.length;
  return { releases, stats, lines: all };
}

function dateOf(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
