/**
 * Pulls docs from configured source repos at build time.
 *
 * - Reads docs-sources.yaml
 * - Honors DOCS_OVERRIDE env var for branch overrides
 * - Caches tarballs in .docs-cache/ so repeated dev runs are fast
 *   (skip cache by setting DOCS_NO_CACHE=1)
 * - Extracts each source's docs/ directory into content/docs/<targetPath>/
 * - Rewrites cross-tree links (../ROADMAP.md) to GitHub blob URLs
 */

import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import * as tar from "tar";
import yaml from "js-yaml";

interface SourceConfig {
  key: string;
  repo: string;
  branch: string;
  docsPath: string;
  targetPath: string;
  externalLinks?: string[];
}

interface SyncConfig {
  sources: SourceConfig[];
}

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "docs-sources.yaml");
const OUTPUT_DIR = path.join(ROOT, "content", "docs");
const CACHE_DIR = path.join(ROOT, ".docs-cache");
const NO_CACHE = process.env.DOCS_NO_CACHE === "1";

function parseOverrides(): Map<string, string> {
  const overrides = new Map<string, string>();
  const raw = process.env.DOCS_OVERRIDE;
  if (!raw) return overrides;
  for (const entry of raw.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx < 0) continue;
    overrides.set(trimmed.slice(0, idx), trimmed.slice(idx + 1));
  }
  return overrides;
}

async function loadConfig(): Promise<SyncConfig> {
  const raw = await readFile(CONFIG_PATH, "utf8");
  const parsed = yaml.load(raw) as SyncConfig;
  if (!parsed?.sources?.length) {
    throw new Error("docs-sources.yaml has no sources");
  }
  return parsed;
}

async function downloadTarball(repo: string, branch: string): Promise<string> {
  const safeName = `${repo.replace("/", "_")}__${branch.replace(/\//g, "_")}.tar.gz`;
  const cachePath = path.join(CACHE_DIR, safeName);

  if (!NO_CACHE && existsSync(cachePath)) {
    const age = Date.now() - (await stat(cachePath)).mtimeMs;
    // 5-minute cache for local dev; CI sets DOCS_NO_CACHE=1
    if (age < 5 * 60 * 1000) {
      console.log(`  cached: ${cachePath}`);
      return cachePath;
    }
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const url = `https://api.github.com/repos/${repo}/tarball/${branch}`;
  console.log(`  downloading: ${url}`);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "glycemicgpt-website-sync-docs",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download tarball: ${res.status} ${res.statusText}`);
  }

  // Write to a tmp path and atomically rename so a partial download doesn't
  // leave a truncated tarball that the cache treats as valid for 5 minutes.
  const tmpPath = `${cachePath}.tmp`;
  try {
    await pipeline(
      Readable.fromWeb(res.body as never),
      createWriteStream(tmpPath),
    );
    const { rename } = await import("node:fs/promises");
    await rename(tmpPath, cachePath);
  } catch (err) {
    if (existsSync(tmpPath)) await rm(tmpPath, { force: true });
    throw err;
  }
  return cachePath;
}

async function extractDocs(
  tarballPath: string,
  source: SourceConfig,
  targetDir: string,
): Promise<void> {
  // GitHub tarballs have a top-level dir like "owner-repo-<sha>/".
  // We strip that plus every segment of docsPath so files land directly under
  // targetDir. Supports nested docsPath values like "apps/web/docs".
  const docsPrefix = source.docsPath.replace(/^\/+|\/+$/g, "");
  const docsPrefixParts = docsPrefix.split("/");
  const strip = 1 + docsPrefixParts.length;
  await mkdir(targetDir, { recursive: true });

  await pipeline(
    createReadStream(tarballPath),
    tar.x({
      cwd: targetDir,
      strip,
      filter: (entryPath) => {
        // entryPath looks like "owner-repo-sha/<docsPath>/foo.md"
        const parts = entryPath.split("/");
        if (parts.length <= strip) return false;
        return parts.slice(1, strip).join("/") === docsPrefix;
      },
    }),
  );
}

async function rewriteLinks(
  dir: string,
  source: SourceConfig,
): Promise<number> {
  let count = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += await rewriteLinks(full, source);
      continue;
    }
    if (!entry.name.endsWith(".md") && !entry.name.endsWith(".mdx")) continue;

    const content = await readFile(full, "utf8");
    let updated = content;

    // Rewrite cross-tree links to GitHub blob URLs. Matches any number of
    // leading ../ segments so links from nested docs (e.g. dev/foo.md
    // referencing ../../CONTRIBUTING.md) are caught.
    if (source.externalLinks?.length) {
      for (const linkTarget of source.externalLinks) {
        const escaped = linkTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(
          `\\]\\((?:\\.\\.\\/)+${escaped}(#[^)]*)?\\)`,
          "g",
        );
        const replacement = `](https://github.com/${source.repo}/blob/${source.branch}/${linkTarget}$1)`;
        updated = updated.replace(pattern, replacement);
      }
    }

    if (updated !== content) {
      await writeFile(full, updated, "utf8");
      count++;
    }
  }
  return count;
}

async function ensureDefaultOpen(targetDir: string): Promise<void> {
  // Make each source's top-level folder render as expanded by default in the
  // sidebar. This is a website-side display preference -- don't push it back
  // into the source repo's _meta.json.
  const metaPath = path.join(targetDir, "_meta.json");
  if (!existsSync(metaPath)) return;
  const raw = await readFile(metaPath, "utf8");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  if (parsed.defaultOpen === true) return;
  parsed.defaultOpen = true;
  await writeFile(metaPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
}

async function syncSource(source: SourceConfig, branch: string): Promise<void> {
  const targetDir = path.join(OUTPUT_DIR, source.targetPath);
  console.log(`\n[${source.key}] ${source.repo}@${branch} -> ${path.relative(ROOT, targetDir)}`);

  await rm(targetDir, { recursive: true, force: true });

  const tarball = await downloadTarball(source.repo, branch);
  // Use a temp dir for staging so the strip-2 doesn't mix sources
  const tmp = path.join(tmpdir(), `docs-sync-${source.key}-${Date.now()}`);
  await mkdir(tmp, { recursive: true });
  try {
    await extractDocs(tarball, source, tmp);
    // Move the extracted contents into targetDir
    await mkdir(path.dirname(targetDir), { recursive: true });
    await rm(targetDir, { recursive: true, force: true });
    const { rename } = await import("node:fs/promises");
    await rename(tmp, targetDir);
    const rewritten = await rewriteLinks(targetDir, { ...source, branch });
    await ensureDefaultOpen(targetDir);
    console.log(`  ok (${rewritten} files had links rewritten)`);
  } finally {
    if (existsSync(tmp)) await rm(tmp, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const config = await loadConfig();
  const overrides = parseOverrides();

  console.log("Syncing docs from source repos...");
  if (overrides.size) {
    console.log(
      `Branch overrides: ${[...overrides.entries()].map(([k, v]) => `${k}->${v}`).join(", ")}`,
    );
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const source of config.sources) {
    const branch = overrides.get(source.key) ?? source.branch;
    try {
      await syncSource(source, branch);
    } catch (err) {
      console.error(`[${source.key}] FAILED:`, err);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
