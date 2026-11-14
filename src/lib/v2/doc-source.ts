import { readFileSync } from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import { WEBSITE_REPO } from "./routes";

/** One entry of docs-sources.yaml, as scripts/sync-docs.ts reads it. */
export interface DocsSyncSource {
  key: string;
  repo: string;
  branch: string;
  /** Folder in the source repo that holds its docs. */
  docsPath: string;
  /** Folder under content/docs that the sync copies them into. */
  targetPath: string;
}

/** Where a docs page is edited: the repo, the branch and the file in it. */
export interface DocSource {
  repo: string;
  branch: string;
  path: string;
  editUrl: string;
}

// Pages that no source syncs are written in this repo, under the folder that
// source.config.ts gives the docs collection.
const WEBSITE_BRANCH = "main";
const WEBSITE_DOCS_DIR = "content/docs";

const FIELDS = ["key", "repo", "branch", "docsPath", "targetPath"] as const;

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

/** Reads the `sources` list out of the text of docs-sources.yaml. */
export function parseDocsSources(raw: string): DocsSyncSource[] {
  const parsed = load(raw) as { sources?: unknown } | null;
  const list = parsed?.sources;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("docs-sources.yaml has no sources");
  }
  return list.map((entry: Record<string, unknown> | null, index) => {
    for (const field of FIELDS) {
      if (typeof entry?.[field] !== "string") {
        throw new Error(
          `docs-sources.yaml: source ${index + 1} has no "${field}"`,
        );
      }
    }
    const source = entry as unknown as DocsSyncSource;
    return {
      key: source.key,
      repo: source.repo,
      branch: source.branch,
      docsPath: source.docsPath,
      targetPath: source.targetPath,
    };
  });
}

/**
 * Applies DOCS_OVERRIDE ("key:branch[,key:branch...]"), which makes the sync
 * pull a source from another branch. The page then came from that branch, so
 * its edit link has to go there too.
 */
export function applyBranchOverrides(
  sources: DocsSyncSource[],
  raw: string | undefined,
): DocsSyncSource[] {
  if (!raw) return sources;
  const overrides = new Map<string, string>();
  for (const entry of raw.split(",")) {
    const trimmed = entry.trim();
    const at = trimmed.indexOf(":");
    if (at < 0) continue;
    overrides.set(trimmed.slice(0, at), trimmed.slice(at + 1));
  }
  return sources.map((source) => ({
    ...source,
    branch: overrides.get(source.key) ?? source.branch,
  }));
}

let cached: DocsSyncSource[] | undefined;

/** The sources the build synced from. Read once, at build time only. */
export function loadDocsSources(): DocsSyncSource[] {
  cached ??= applyBranchOverrides(
    parseDocsSources(
      readFileSync(path.join(process.cwd(), "docs-sources.yaml"), "utf8"),
    ),
    process.env.DOCS_OVERRIDE,
  );
  return cached;
}

function encodePath(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}

/**
 * Finds the file a docs page was built from. `pagePath` is the page's file
 * path under content/docs, such as "platform/install/docker.md". The sync
 * copies a source's docs folder into its target folder without renaming
 * anything, so the upstream path is the docs folder plus the rest of the page
 * path. A page under no target belongs to this repo.
 */
export function resolveDocSource(
  pagePath: string,
  sources: readonly DocsSyncSource[],
): DocSource {
  const file = trimSlashes(pagePath);
  let match: DocsSyncSource | undefined;
  let matchTarget = "";
  for (const source of sources) {
    const target = trimSlashes(source.targetPath);
    // The longest target wins, so one source can sync into another's subfolder.
    if (
      target &&
      file.startsWith(`${target}/`) &&
      target.length > matchTarget.length
    ) {
      match = source;
      matchTarget = target;
    }
  }

  const located = match
    ? {
        repo: match.repo,
        branch: match.branch,
        path: [trimSlashes(match.docsPath), file.slice(matchTarget.length + 1)]
          .filter(Boolean)
          .join("/"),
      }
    : {
        repo: WEBSITE_REPO,
        branch: WEBSITE_BRANCH,
        path: `${WEBSITE_DOCS_DIR}/${file}`,
      };

  // The edit view, not the file view: GitHub offers a fork to anyone who
  // cannot push to the repo.
  const editUrl = `https://github.com/${located.repo}/edit/${encodePath(located.branch)}/${encodePath(located.path)}`;
  return { ...located, editUrl };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** A date as "14 Nov 2026", in UTC so it reads the same wherever it is built. */
export function formatSyncDate(date: Date): { iso: string; label: string } {
  return {
    iso: date.toISOString().slice(0, 10),
    label: `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
  };
}
