/**
 * Pulls the roadmap from lumose-health/.github (docs/roadmap.md) at build time
 * and writes src/data/roadmap.json with headings only.
 *
 * Only the lead line, `##` phase titles, `**Focus:**` lines and `###` item
 * titles are kept. Bullets and body text are never published, and the
 * Current State (Delivered) section is left out, because the source still
 * lists alerting as delivered. Titles and focus lines go through the same
 * banned-word, safety-claim and dosing-advice checks as the changelog, and every string is
 * plain text.
 *
 * This never fails the build because of GitHub. If the file can't be fetched
 * or parses to nothing usable, the existing JSON is kept. With no JSON yet, an
 * empty file is written.
 *
 * Set GITHUB_TOKEN to avoid the 60 requests/hour anonymous limit. Read access
 * to public data is all it needs.
 *
 * `--save-fixture` also writes the raw doc to scripts/fixtures/roadmap.md,
 * which the tests run against.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { BANNED, isBanned, isDosingAdvice, isSafetyClaim, plain } from "./lib/filter-release-notes";
import { GitHubError } from "./sync-releases";

export const SOURCE_REPO = "lumose-health/.github";
export const SOURCE_PATH = "docs/roadmap.md";
const SOURCE_URL = `https://github.com/${SOURCE_REPO}/blob/main/${SOURCE_PATH}`;

const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src", "data", "roadmap.json");
const FIXTURE_FILE = path.join(ROOT, "scripts", "fixtures", "roadmap.md");
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 512 * 1024;

// Caps on what a changed source doc can put on the page.
const MAX_PHASES = 12;
const MAX_ITEMS = 30;
const MAX_TITLE = 120;
const MAX_LINE = 240;

/** Alerting is in development, so these items carry the in-development pill. */
const IN_DEVELOPMENT = /alert|escalat/i;
/** The `##` sections that are phases. Vision, Guiding Principles and the rest are not. */
const PHASE_HEADING = /^(phase \d{1,2}|ongoing)$/i;
const DELIVERED_HEADING = /^current state\b/i;

export interface RoadmapItem {
  title: string;
  inDevelopment: boolean;
}

export interface RoadmapPhase {
  /** Anchor id, such as "phase-1" or "ongoing". */
  id: string;
  /** "Phase 1" or "Ongoing". */
  label: string;
  /** The part after the label, such as "Stability & Trust". */
  title: string;
  focus: string | null;
  items: RoadmapItem[];
}

export interface RoadmapData {
  generatedAt: string;
  source: { repo: string; path: string; url: string };
  /** The source's own "sequenced, not scheduled" line. */
  lead: string | null;
  phases: RoadmapPhase[];
}

export type DropReason =
  | "banned"
  | "safety-claim"
  | "dosing-advice"
  | "not-a-phase"
  | "delivered"
  | "empty"
  | "too-many";

/** Why a heading or line can't be published, or null when it can. */
function blocked(raw: string): "banned" | "safety-claim" | "dosing-advice" | null {
  if (isBanned(raw)) return "banned";
  if (isSafetyClaim(raw)) return "safety-claim";
  return isDosingAdvice(raw) ? "dosing-advice" : null;
}

export interface Dropped {
  kind: "lead" | "phase" | "focus" | "item";
  text: string;
  reason: DropReason;
}

/** Plain text, "GlycemicGPT" renamed, `--` shown as a dash, capped in length. */
export function cleanLine(raw: string, max = MAX_LINE): string {
  // HTML comments go whole, including an unclosed one, before plain() sees them.
  let t = plain(raw.replace(/<!--[\s\S]*?(?:-->|$)/g, " "))
    // plain() removes http and https links; other schemes and bare www. hosts go too.
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/\S*|\bwww\.\S+/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/glycemic\s*gpt/gi, "Lumose")
    .replace(/\s+-{2,3}\s+/g, " — ")
    .trim();
  if (t.length > max) t = t.slice(0, max - 1).trimEnd() + "…";
  return t;
}

/** "Phase 1 -- Stability & Trust" → label "Phase 1", title "Stability & Trust". */
function splitPhase(heading: string): { label: string; title: string } | null {
  const text = cleanLine(heading, MAX_TITLE);
  const m = text.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  const label = (m ? m[1] : text).trim();
  if (!PHASE_HEADING.test(label)) return null;
  return { label, title: m ? m[2].trim() : "" };
}

/** Parses the roadmap doc into headings, with a record of everything dropped. */
export function parseRoadmap(doc: string): { lead: string | null; phases: RoadmapPhase[]; dropped: Dropped[] } {
  const lines = doc.replace(/^﻿/, "").split(/\r?\n/);
  const phases: RoadmapPhase[] = [];
  const dropped: Dropped[] = [];
  let lead: string | null = null;
  let current: RoadmapPhase | null = null;
  // "skip" means inside a ## section that isn't published at all.
  let section: "none" | "phase" | "skip" = "none";
  let inFence = false;
  let i = 0;

  // YAML frontmatter.
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, n) => n > 0 && l.trim() === "---");
    if (end > 0) i = end + 1;
  }

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h = line.match(/^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
    // A top-level heading, or a setext heading under a paragraph line, ends the
    // current section. Neither is a phase, so what follows is skipped.
    const setext = /^ {0,3}(=+|-+)\s*$/.test(line) && /^ {0,3}[^\s#>*+\-|]/.test(lines[i - 1] ?? "");
    if ((h && h[1].length === 1) || setext) {
      current = null;
      section = "skip";
      continue;
    }
    if (h && h[1].length === 2) {
      current = null;
      const heading = plain(h[2]);
      if (DELIVERED_HEADING.test(heading)) {
        section = "skip";
        dropped.push({ kind: "phase", text: heading, reason: "delivered" });
        continue;
      }
      const parts = splitPhase(h[2]);
      if (!parts) {
        section = "skip";
        dropped.push({ kind: "phase", text: heading, reason: "not-a-phase" });
        continue;
      }
      section = "phase";
      const phaseBlock = blocked(h[2]);
      if (phaseBlock) {
        section = "skip";
        dropped.push({ kind: "phase", text: heading, reason: phaseBlock });
        continue;
      }
      if (phases.length >= MAX_PHASES) {
        section = "skip";
        dropped.push({ kind: "phase", text: heading, reason: "too-many" });
        continue;
      }
      const id = parts.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (phases.some((p) => p.id === id)) {
        section = "skip";
        dropped.push({ kind: "phase", text: heading, reason: "not-a-phase" });
        continue;
      }
      current = { id, label: parts.label, title: parts.title, focus: null, items: [] };
      phases.push(current);
      continue;
    }

    if (h && h[1].length === 3) {
      if (section !== "phase" || !current) continue;
      const title = cleanLine(h[2], MAX_TITLE);
      const itemBlock = blocked(h[2]);
      if (itemBlock) dropped.push({ kind: "item", text: plain(h[2]), reason: itemBlock });
      else if (title.length < 2) dropped.push({ kind: "item", text: plain(h[2]), reason: "empty" });
      else if (current.items.length >= MAX_ITEMS) dropped.push({ kind: "item", text: title, reason: "too-many" });
      else current.items.push({ title, inDevelopment: IN_DEVELOPMENT.test(title) });
      continue;
    }
    if (h) continue;

    const focus = line.match(/^\s*\*\*Focus:\*\*\s*(.+)$/i);
    if (focus) {
      if (section !== "phase" || !current || current.focus !== null) continue;
      const text = cleanLine(focus[1]);
      const focusBlock = blocked(focus[1]);
      if (focusBlock) dropped.push({ kind: "focus", text: plain(focus[1]), reason: focusBlock });
      else if (text) current.focus = text;
      continue;
    }

    // The lead is the first italic paragraph before any section.
    if (section === "none" && lead === null) {
      const m = line.match(/^\s*([*_])(?![*_])(.+)\1\s*$/);
      if (m) {
        const text = cleanLine(m[2]);
        const leadBlock = blocked(m[2]);
        if (leadBlock) dropped.push({ kind: "lead", text: plain(m[2]), reason: leadBlock });
        else if (text) lead = text;
      }
    }
  }
  return { lead, phases, dropped };
}

export type TextFetcher = (url: string) => Promise<string>;

function ghFetcher(): TextFetcher {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
    "User-Agent": "lumose-health-website-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  return async (url: string) => {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new GitHubError(res.status, url);
    const text = await res.text();
    if (text.length > MAX_BYTES) throw new Error("roadmap is larger than expected");
    return text;
  };
}

export function fetchRoadmap(get: TextFetcher): Promise<string> {
  return get(`https://api.github.com/repos/${SOURCE_REPO}/contents/${SOURCE_PATH}`);
}

const emptyData = (): RoadmapData => ({
  generatedAt: new Date().toISOString(),
  source: { repo: SOURCE_REPO, path: SOURCE_PATH, url: SOURCE_URL },
  lead: null,
  phases: [],
});

async function writeText(file: string, text: string) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}

async function readPrevious(file: string): Promise<RoadmapData | null> {
  if (!existsSync(file)) return null;
  try {
    const prev = JSON.parse(await readFile(file, "utf8")) as RoadmapData;
    return Array.isArray(prev?.phases) ? prev : null;
  } catch {
    return null;
  }
}

export async function sync({
  get = ghFetcher(),
  outFile = OUT_FILE,
  fixtureFile = null as string | null,
}: {
  get?: TextFetcher;
  outFile?: string;
  fixtureFile?: string | null;
} = {}): Promise<{ result: "synced" | "kept" | "empty"; dropped?: Dropped[] }> {
  let data: RoadmapData;
  let dropped: Dropped[];
  try {
    const doc = await fetchRoadmap(get);
    if (typeof doc !== "string") throw new Error("expected the roadmap as text");
    const parsed = parseRoadmap(doc);
    if (!parsed.phases.some((p) => p.label.toLowerCase().startsWith("phase"))) throw new Error("no phases found");
    data = { ...emptyData(), lead: parsed.lead, phases: parsed.phases };
    // Last line of defense: the parser should already have removed these.
    if (BANNED.test(JSON.stringify(data))) throw new Error("filtered output still contains a banned word");
    dropped = parsed.dropped;
    if (fixtureFile) await writeText(fixtureFile, doc);
  } catch (err) {
    const reason = (err as Error).message;
    const prev = await readPrevious(outFile);
    if (prev) {
      await writeText(outFile, JSON.stringify(prev, null, 2) + "\n");
      console.warn(`roadmap: sync failed (${reason}); keeping data from ${prev.generatedAt}`);
      return { result: "kept" };
    }
    console.warn(`roadmap: sync failed (${reason}); writing empty data`);
    await writeText(outFile, JSON.stringify(emptyData(), null, 2) + "\n");
    return { result: "empty" };
  }

  await writeText(outFile, JSON.stringify(data, null, 2) + "\n");
  const items = data.phases.reduce((n, p) => n + p.items.length, 0);
  console.log(`roadmap: ${data.phases.length} phases, ${items} items -> ${path.relative(ROOT, outFile)}`);
  for (const d of dropped) console.log(`roadmap: dropped ${d.kind} (${d.reason}): ${d.text}`);
  return { result: "synced", dropped };
}

if (require.main === module) {
  sync({ fixtureFile: process.argv.includes("--save-fixture") ? FIXTURE_FILE : null }).catch((err) => {
    // Only local file errors reach here; GitHub failures are handled in sync().
    console.error(err);
    process.exit(1);
  });
}
