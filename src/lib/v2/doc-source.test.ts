import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  applyBranchOverrides,
  formatSyncDate,
  parseDocsSources,
  resolveDocSource,
} from "./doc-source";

const live = parseDocsSources(
  readFileSync(path.join(__dirname, "../../../docs-sources.yaml"), "utf8"),
);

// A source that is not in the real file: another branch, a nested docs folder
// and a target inside another source's target.
const FIXTURE = `
sources:
  - key: lumose
    repo: lumose-health/lumose
    branch: main
    docsPath: docs/
    targetPath: platform/
    externalLinks:
      - README.md
  - key: android
    repo: lumose-health/android-unofficial
    branch: develop
    docsPath: /apps/mobile/docs/
    targetPath: android
  - key: plugins
    repo: lumose-health/plugins
    branch: release/1.x
    docsPath: docs
    targetPath: platform/plugins/
`;

test("the real file maps both synced folders to their repos", () => {
  assert.deepEqual(resolveDocSource("platform/install/docker.md", live), {
    repo: "lumose-health/lumose",
    branch: "main",
    path: "docs/install/docker.md",
    editUrl:
      "https://github.com/lumose-health/lumose/edit/main/docs/install/docker.md",
  });
  assert.deepEqual(resolveDocSource("about/roadmap.md", live), {
    repo: "lumose-health/.github",
    branch: "main",
    path: "docs/roadmap.md",
    editUrl:
      "https://github.com/lumose-health/.github/edit/main/docs/roadmap.md",
  });
});

test("index pages and file extensions keep their upstream names", () => {
  assert.equal(resolveDocSource("platform/index.md", live).path, "docs/index.md");
  assert.equal(
    resolveDocSource("platform/troubleshooting/index.md", live).path,
    "docs/troubleshooting/index.md",
  );
  assert.equal(
    resolveDocSource("platform/mobile/status-icons.mdx", live).path,
    "docs/mobile/status-icons.mdx",
  );
  assert.equal(
    resolveDocSource("platform/concepts/features/knowledge-base.md", live).path,
    "docs/concepts/features/knowledge-base.md",
  );
});

test("a page under no synced folder belongs to the website repo", () => {
  assert.deepEqual(resolveDocSource("index.mdx", live), {
    repo: "lumose-health/website",
    branch: "main",
    path: "content/docs/index.mdx",
    editUrl:
      "https://github.com/lumose-health/website/edit/main/content/docs/index.mdx",
  });
  assert.equal(
    resolveDocSource("guides/setup.mdx", live).path,
    "content/docs/guides/setup.mdx",
  );
  // A folder that only starts with a target's name is not that target.
  assert.equal(
    resolveDocSource("platform-notes/intro.md", live).repo,
    "lumose-health/website",
  );
  assert.equal(
    resolveDocSource("platform.md", live).repo,
    "lumose-health/website",
  );
});

test("a source added to the file later is picked up", () => {
  const sources = parseDocsSources(FIXTURE);
  assert.deepEqual(resolveDocSource("android/pairing/medtronic.md", sources), {
    repo: "lumose-health/android-unofficial",
    branch: "develop",
    path: "apps/mobile/docs/pairing/medtronic.md",
    editUrl:
      "https://github.com/lumose-health/android-unofficial/edit/develop/apps/mobile/docs/pairing/medtronic.md",
  });
  assert.equal(
    resolveDocSource("android/index.md", sources).path,
    "apps/mobile/docs/index.md",
  );
});

test("the longest matching target wins", () => {
  const sources = parseDocsSources(FIXTURE);
  const nested = resolveDocSource("platform/plugins/writing one.md", sources);
  assert.equal(nested.repo, "lumose-health/plugins");
  assert.equal(nested.path, "docs/writing one.md");
  assert.equal(
    nested.editUrl,
    "https://github.com/lumose-health/plugins/edit/release/1.x/docs/writing%20one.md",
  );
  assert.equal(
    resolveDocSource("platform/get-started.md", sources).repo,
    "lumose-health/lumose",
  );
  assert.equal(
    resolveDocSource("platform/get-started.md", [...sources].reverse()).repo,
    "lumose-health/lumose",
  );
});

test("a branch override moves the edit link to that branch", () => {
  const sources = applyBranchOverrides(
    live,
    "lumose:feat/docs-rewrite, unknown:x, broken",
  );
  assert.equal(
    resolveDocSource("platform/index.md", sources).editUrl,
    "https://github.com/lumose-health/lumose/edit/feat/docs-rewrite/docs/index.md",
  );
  assert.equal(resolveDocSource("about/roadmap.md", sources).branch, "main");
  assert.equal(applyBranchOverrides(live, undefined), live);
});

test("a file with no usable sources is rejected", () => {
  assert.throws(() => parseDocsSources("sources: []"), /no sources/);
  assert.throws(() => parseDocsSources(""));
  assert.throws(
    () => parseDocsSources("sources:\n  - key: a\n    repo: o/r\n"),
    /source 1 has no "branch"/,
  );
});

test("the sync date is written in UTC", () => {
  assert.deepEqual(formatSyncDate(new Date("2026-11-14T23:59:59Z")), {
    iso: "2026-11-14",
    label: "14 Nov 2026",
  });
  // Already the 2nd in Auckland and still the 1st in UTC.
  assert.deepEqual(formatSyncDate(new Date("2027-01-02T09:30:00+13:00")), {
    iso: "2027-01-01",
    label: "1 Jan 2027",
  });
});
