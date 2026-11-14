import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  buildChangelog,
  classifyLine,
  filterNotes,
  BANNED,
  isStable,
  plain,
  type RawRelease,
  type Release,
} from "./lib/filter-release-notes";
import { fetchReleases, GitHubError, sync, type ChangelogData, type JsonFetcher } from "./sync-releases";

// Real release notes from lumose-health/lumose, saved with `npx tsx scripts/sync-releases.ts --save-fixture`.
const FIXTURE: RawRelease[] = JSON.parse(readFileSync(path.join(__dirname, "fixtures", "releases.json"), "utf8"));
const REAL = buildChangelog(FIXTURE);
const allEntries = (releases: Release[]) => releases.flatMap((r) => [...r.new, ...r.fixed, ...r.breaking]);
const REAL_ENTRIES = allEntries(REAL.releases);
// Read from scripts/check-v2.sh, so these tests follow any change to its scan.
const CHECK_V2_TERMS = (() => {
  const m = readFileSync(path.join(__dirname, "check-v2.sh"), "utf8").match(/^banned='([^']+)'$/m);
  if (!m) throw new Error("banned= pattern not found in scripts/check-v2.sh");
  return m[1].split("|");
})();
const CHECK_V2_BANNED = new RegExp(CHECK_V2_TERMS.join("|"), "i");

const release = (tag: string, body: string, extra: Partial<RawRelease> = {}): RawRelease => ({
  tag_name: tag,
  published_at: "2026-11-05T16:27:45Z",
  prerelease: false,
  draft: false,
  body,
  ...extra,
});
const author = "[@alice](https://github.com/alice)";
const pr = (n: number) => `([#${n}](https://github.com/GlycemicGPT/GlycemicGPT/pull/${n}))`;
const keptText = (line: string, heading: "new" | "fixed" | "breaking" | undefined = "new") =>
  classifyLine(line, null, heading).kept?.text;

test("the fixture is real data with the shapes the filter handles", () => {
  assert.ok(FIXTURE.length > 100, "expected the saved release list");
  assert.ok(FIXTURE.some((r) => r.tag_name === "dev-latest" && r.prerelease === true));
  assert.ok(REAL.releases.length > 100);
  assert.ok(REAL_ENTRIES.length > 200);
});

test("AC1: pre-releases, drafts and non-version tags are dropped", () => {
  assert.equal(isStable(release("v0.16.0", "")), true);
  assert.equal(isStable(release("dev-latest", "", { prerelease: true })), false);
  assert.equal(isStable(release("v0.17.0", "", { draft: true })), false);
  assert.equal(isStable(release("changelog-2026-04-03", "")), false);
  const versions = REAL.releases.map((r) => r.version);
  assert.ok(!versions.includes("dev-latest"));
  assert.ok(versions.every((v) => /^v\d+\.\d+\.\d+$/.test(v)));
  assert.equal(versions[0], "v0.16.0", "newest first");
});

test("AC2: chores, sync-release, merge-bot, dependency lines, Other Changes and Container Images are dropped", () => {
  const body = [
    "## v1.0.0",
    "### 🌐 Web",
    "#### ✨ New Features",
    `- chore: tidy the repo ${author} ${pr(1)}`,
    `- chore: sync release 0.15.0 from main to develop [@glycemicgpt-merge](https://github.com/glycemicgpt-merge) ${pr(2)}`,
    `- feat: something from a bot [@renovate[bot]](https://github.com/apps/renovate) ${pr(3)}`,
    `- fix(deps): update dependency next to v16 ${author} ${pr(4)}`,
    `- feat: real feature ${author} ${pr(5)}`,
    "#### 📝 Other Changes",
    `- Store one timezone per user ${author} ${pr(6)}`,
    "---",
    "## 🐳 Container Images",
    "- `ghcr.io/lumose-health/glycemicgpt-api`",
    "```bash",
    "docker pull ghcr.io/lumose-health/glycemicgpt-api:0.16.0",
    "```",
  ].join("\n");
  const lines = filterNotes(body);
  assert.deepEqual(
    lines.map((l) => l.kept?.text ?? l.reason),
    ["chore", "bot", "bot", "dependency", "Real feature", "other-changes", "container-images"]
  );
  assert.equal(keptText(`**deps:** update retrofit monorepo to v2.12.0 ${pr(7)}`), undefined);
  assert.equal(keptText("fix(api): bump pyjwt to 2.13.0"), undefined);
  // Product changes that mention updating a value are not dependency lines.
  assert.equal(keptText("update low glucose threshold to 70"), "Update low glucose threshold to 70");
  assert.equal(keptText("bump session timeout to 30 days"), "Bump session timeout to 30 days");
  assert.equal(keptText(`**ci:** skip self-approval for release PR auto-merge ${pr(8)}`), undefined);

  for (const e of REAL_ENTRIES) {
    assert.doesNotMatch(e.text, /^chore\b|sync release|from main to develop|renovate|dependabot|ghcr\.io/i, e.text);
  }
});

test("AC3: prefixes, heading emoji and planning references are stripped, first letter capitalized", () => {
  assert.equal(keptText(`feat(web): add a chart ${author} ${pr(1)}`), "Add a chart");
  assert.equal(keptText(`**api:** add BYOAI abstraction layer (Story 5.2) ${pr(34)}`), "Add BYOAI abstraction layer");
  assert.equal(keptText("add caregiver dashboard view (Story 8.3)"), "Add caregiver dashboard view");
  assert.equal(keptText("Story 30.3 -- CGM Summary Stats Panel"), "CGM Summary Stats Panel");
  assert.equal(keptText("Epic 28 security hardening (stories 28.1-28.10)"), "Security hardening");
  assert.equal(keptText("feat:(GLY-57) upgrade tailwind 4"), "Upgrade tailwind 4");
  assert.equal(keptText("read endpoint + picker preference (43.12 PR 3)"), "Read endpoint + picker preference");
  assert.equal(keptText("reuse connection on re-add (#1025)"), "Reuse connection on re-add");
  // Identifiers and units keep their case.
  assert.equal(keptText("mmol/L glucose unit toggle"), "mmol/L glucose unit toggle");
  assert.equal(keptText("populate bg_at_event on boluses"), "Populate bg_at_event on boluses");

  const [web] = filterNotes(`### 🌐 Web\n#### ✨ New Features\n- feat: x thing ${pr(1)}`);
  assert.equal(web.kept?.area, "Web");
  assert.equal(filterNotes("### ❓ Uncategorized\n- feat: y thing")[0].kept?.area, null);

  for (const e of REAL_ENTRIES) {
    assert.doesNotMatch(e.text, /\b(?:story|stories|epic)\s+\d/i, e.text);
    assert.doesNotMatch(e.text, /^[a-z]+(?:\([^)]*\))?!?:/, e.text);
    assert.doesNotMatch(e.text + (e.area ?? ""), /\p{Extended_Pictographic}/u, e.text);
  }
});

test("AC4: lines naming Telegram, prediction, forecasts, push notifications, FCM, APNs or alarms are dropped", () => {
  for (const line of [
    "feat(api): forecast read endpoint + picker preference (43.12 PR 3)",
    "add IoB projection engine with decay curve",
    "**api:** add Telegram alert delivery for glucose alerts (Story 7.2)",
    "add predictive alert engine with IoB escalation (Story 6.2)",
    "implement caregiver and emergency contact push notifications",
    "feat: wire FCM tokens",
    "feat: APNs support",
    "feat: iOS alarm sound",
    // A banned word inside a link, or split by markdown, still counts.
    "feat: chat bridge ([docs](https://example.com/telegram))",
    "feat: caregiver push **notifications**",
    "feat: caregiver push <b>notif</b>ications",
    // Hyphens, underscores, zero-width characters, soft hyphens and entities.
    "feat: tele-gram bridge",
    "feat: push_notifications",
    "feat: tele\u200Bgram bridge",
    "feat: fore\u00ADcast picker",
    "feat: wire F-C-M tokens",
    "feat: a_p_n_s support",
    "feat: tele&#103;ram bridge",
    "feat: tele&#x67;ram bridge",
    "feat: pre&shy;dict lows",
    "feat: ALWAYS-FIRES alerts",
    // Look-alike Cyrillic letters fold to Latin; other Cyrillic text drops the line.
    "feat: \u0442elegram bridge",
    "feat: \u0430l\u0430rm sounds",
    "feat: \u0436\u0443\u0440\u043d\u0430\u043b",
  ]) {
    assert.equal(classifyLine(line, null, "new").reason, "banned", line);
  }
  // Pushing data to the watch isn't a notification, and "fcm" across words isn't FCM.
  for (const line of [
    "**mobile:** phone-side Watch Face Push via ChannelClient",
    "feat: poll/persist/push pipeline integration with single-flight reads",
    "fix: show list of cmd options",
    "feat: map snapshots",
  ]) {
    assert.equal(classifyLine(line, null, "new").reason, null, line);
  }
  assert.ok(REAL_ENTRIES.some((e) => /watch face push/i.test(e.text)));
  assert.ok(REAL_ENTRIES.some((e) => /push pipeline/i.test(e.text)));
});

test("lines that make safety claims are dropped", () => {
  for (const line of [
    "feat: surface glucose-relevant meal nutrition with never-dose guardrails",
    "**api:** add pre-validation safety layer for AI suggestions (Story 5.6)",
    "feat: never dose without a check",
  ]) {
    assert.equal(classifyLine(line, null, "new").reason, "safety-claim", line);
  }
  for (const e of REAL_ENTRIES) assert.doesNotMatch(e.text, /guardrail|safety layer|never[\s-]*dose/i, e.text);
});

test("lines about safety mechanisms and blocked doses are dropped", () => {
  for (const line of [
    "feat: block verb-independent specific insulin doses",
    "feat: backend treatment safety scaffolding",
    "feat: Gradle module split and backend-synced safety limits",
    "feat: add a safety-limit check",
    "feat: platform safety enforcement",
    "fix: blocking of insulin dosing advice",
  ]) {
    assert.equal(classifyLine(line, null, "new").reason, "safety-claim", line);
  }
  // The raw notes do contain them, so the test is meaningful.
  const raw = JSON.stringify(FIXTURE);
  for (const dropped of [
    /block verb-independent specific insulin doses/i,
    /backend treatment safety scaffolding/i,
    /backend-synced safety limits/i,
  ]) {
    assert.match(raw, dropped);
    for (const e of REAL_ENTRIES) assert.doesNotMatch(e.text, dropped, e.text);
  }
});

test("lines that only count or import doses are kept", () => {
  for (const text of [
    "Count non-pump insulin doses past the pump IoB anchor",
    "Ingest smart-pen insulin doses (NovoPen 6 / Echo Plus) via Glooko",
    "Harden Glooko host validation, 421 posture, and dose ingestion bounds",
  ]) {
    assert.ok(REAL_ENTRIES.some((e) => e.text === text), text);
  }
});

test("lines the owner hasn't ruled on still pass through", () => {
  for (const text of [
    "LLM benchmarking harness for BYOAI model safety/quality",
    "Add correction factor analysis with ISF suggestions",
    "Add meal pattern analysis with carb ratio suggestions",
  ]) {
    assert.ok(REAL_ENTRIES.some((e) => e.text === text), text);
  }
});

test("two kept lines are reworded so they don't read as safety claims", () => {
  assert.equal(keptText("fix: harden glucose ingestion for mmol/L unit safety"), "Harden glucose ingestion for mmol/L units");
  assert.equal(keptText("feat: meal-vision safety-language hardening"), "Meal-vision wording hardening");
  const texts = REAL_ENTRIES.map((e) => e.text);
  assert.ok(texts.includes("Harden glucose ingestion for mmol/L units"));
  assert.ok(texts.includes("Meal-vision wording hardening"));
  for (const t of texts) assert.doesNotMatch(t, /unit safety|safety-language/i, t);
});

test("AC5: alerting-related lines are kept and flagged in development", () => {
  const a = classifyLine("add alert threshold configuration (Story 6.1)", "API", "new").kept;
  assert.equal(a?.inDevelopment, true);
  assert.equal(classifyLine("add escalation timing configuration", null, "new").kept?.inDevelopment, true);
  for (const line of [
    "request notification permission",
    "notify caregivers",
    "add emergency contact configuration",
    "urgent low handling",
    "siren sound option",
  ]) {
    assert.equal(classifyLine(line, null, "new").kept?.inDevelopment, true, line);
  }
  // Shipped features: caregiver access and thresholds that also drive Time in Range.
  for (const line of ["add a chart", "add caregiver dashboard view", "make glucose thresholds dynamic"]) {
    assert.equal(classifyLine(line, null, "new").kept?.inDevelopment, false, line);
  }
  const marker = /alert|escalat|notif|emergency|urgent|siren/i;
  const flagged = REAL_ENTRIES.filter((e) => e.inDevelopment);
  assert.ok(flagged.length > 0);
  assert.ok(flagged.every((e) => marker.test(e.text)));
  assert.ok(REAL_ENTRIES.filter((e) => marker.test(e.text)).every((e) => e.inDevelopment));
});

test("AC6: PR links are rebuilt for lumose-health/lumose from the number alone", () => {
  const old = classifyLine(
    "**web:** add TrendArrow component ([#22](https://github.com/jlengelbrecht/GlycemicGPT/issues/22)) ([cc765d4](https://github.com/jlengelbrecht/GlycemicGPT/commit/cc765d4))",
    null,
    "new"
  ).kept;
  assert.deepEqual(old?.pr, { number: 22, url: "https://github.com/lumose-health/lumose/pull/22" });
  assert.equal(classifyLine("add a thing ([abc1234](https://x/commit/abc1234))", null, "new").kept?.pr, null);
  for (const e of REAL_ENTRIES) {
    if (e.pr) assert.match(e.pr.url, /^https:\/\/github\.com\/lumose-health\/lumose\/pull\/\d+$/);
  }
  for (const r of REAL.releases) {
    assert.equal(r.url, `https://github.com/lumose-health/lumose/releases/tag/${r.version}`);
  }
});

test("AC7: a release with nothing left is marked maintenance", () => {
  const { releases } = buildChangelog([
    release("v1.0.1", `### 🌐 Web\n#### 📝 Other Changes\n- chore: sync release 1.0.0 ${pr(1)}`),
    release("v1.0.0", `### 🌐 Web\n#### ✨ New Features\n- feat: a thing ${pr(2)}`),
  ]);
  assert.deepEqual(
    releases.map((r) => [r.version, r.maintenance]),
    [
      ["v1.0.1", true],
      ["v1.0.0", false],
    ]
  );
  assert.ok(REAL.releases.some((r) => r.maintenance));
  assert.ok(REAL.releases.every((r) => r.maintenance === r.new.length + r.fixed.length + r.breaking.length < 1));
});

test("a change listed again in a later release stays with the release that first shipped it", () => {
  const { releases } = buildChangelog([
    release("v1.0.1", `### ✨ Features\n* a thing ${pr(2)}\n* another thing ${pr(3)}`),
    release("v1.0.0", `### ✨ Features\n* a thing ${pr(2)}`),
  ]);
  assert.deepEqual(
    releases.map((r) => r.new.map((e) => e.text)),
    [["Another thing"], ["A thing"]]
  );
});

test("a Breaking line is kept even when the same PR is also listed under New", () => {
  const { releases } = buildChangelog([
    release(
      "v1.0.0",
      `### 🌐 Web\n#### ✨ New Features\n- feat: a thing ${pr(2)}\n### 📡 API\n#### 💥 Breaking Changes\n- feat: a thing ${pr(2)}`
    ),
  ]);
  assert.deepEqual(releases[0].breaking.map((e) => e.text), ["A thing"]);
  assert.deepEqual(releases[0].new.map((e) => e.text), ["A thing"]);
});

test("zero-width characters and soft hyphens are removed, not turned into spaces", () => {
  assert.equal(plain("glu\u200Bcose\u00AD level\uFEFF"), "glucose level");
});

test("HTML and markdown never reach the output", () => {
  const nasty = [
    `feat: <script>alert(1)</script> chart ${pr(1)}`,
    'feat: <img src=x onerror="steal()"> picture',
    "feat: [click](javascript:alert(1)) link",
    "feat: **bold** and `code` and ~~gone~~ text",
    "feat: Settings &gt; Watch &amp; phone -&gt; watch",
    "feat: trailing <b",
    "fix: warn when glucose < 70 or > 180 mg/dL",
  ].map((l) => classifyLine(l, null, "new").kept?.text);
  assert.deepEqual(nasty, [
    "Alert(1) chart",
    "Picture",
    "Click link",
    "Bold and code and gone text",
    "Settings > Watch & phone → watch",
    "Trailing",
    "Warn when glucose < 70 or > 180 mg/dL",
  ]);
  assert.equal(plain("a\u0000b\u202Ec"), "a bc");
  for (const e of REAL_ENTRIES) {
    assert.doesNotMatch(e.text, /<\/?[a-z]|[[\]`*]|\]\(|https?:|&[a-z]+;/i, e.text);
    assert.ok(e.text.length <= 240);
  }
});

test("the filter bans every term check-v2.sh scans for", () => {
  assert.ok(CHECK_V2_TERMS.length > 5);
  for (const term of CHECK_V2_TERMS) assert.match(term, BANNED, term);
});

test("AC9: the filtered real notes contain no banned word anywhere", () => {
  const json = JSON.stringify(REAL.releases);
  assert.doesNotMatch(json, /telegram/i);
  assert.doesNotMatch(json, CHECK_V2_BANNED);
  // The raw notes do contain them, so the test is meaningful.
  assert.match(JSON.stringify(FIXTURE), /telegram/i);
  assert.ok((REAL.stats.dropped.banned ?? 0) > 0);
});

test("AC10: the committed changelog.json passes the check-v2 banned-word scan", () => {
  const committed = readFileSync(path.join(__dirname, "..", "src", "data", "changelog.json"), "utf8");
  assert.doesNotMatch(committed, CHECK_V2_BANNED);
  const data = JSON.parse(committed) as ChangelogData;
  assert.ok(Array.isArray(data.releases));
});

test("fetchReleases follows pages until a short page", async () => {
  const urls: string[] = [];
  const get: JsonFetcher = async (url) => {
    urls.push(url);
    return url.endsWith("page=1") ? Array.from({ length: 100 }, (_, i) => release(`v0.0.${i}`, "")) : [release("v1.0.0", "")];
  };
  const all = await fetchReleases(get);
  assert.equal(all.length, 101);
  assert.deepEqual(
    urls.map((u) => new URL(u).search),
    ["?per_page=100&page=1", "?per_page=100&page=2"]
  );
});

async function tempFile() {
  return path.join(await mkdtemp(path.join(tmpdir(), "releases-")), "changelog.json");
}
const quiet = <T>(fn: () => Promise<T>) => {
  const warn = console.warn;
  const log = console.log;
  console.warn = console.log = () => {};
  return fn().finally(() => {
    console.warn = warn;
    console.log = log;
  });
};

test("AC8: when GitHub fails, the last JSON stays in place", async () => {
  const outFile = await tempFile();
  const prev: ChangelogData = { generatedAt: "2026-01-01T00:00:00Z", repo: "x", releasesUrl: "y", releases: [] };
  await writeFile(outFile, JSON.stringify(prev));
  const failing: JsonFetcher = async (url) => {
    throw new GitHubError(403, url);
  };
  const { result } = await quiet(() => sync({ get: failing, outFile }));
  assert.equal(result, "kept");
  assert.deepEqual(JSON.parse(await readFile(outFile, "utf8")), prev);
});

test("with no earlier JSON, a failed sync writes an empty changelog", async () => {
  const outFile = await tempFile();
  const { result } = await quiet(() => sync({ get: async () => "not a list", outFile }));
  assert.equal(result, "empty");
  const data = JSON.parse(await readFile(outFile, "utf8")) as ChangelogData;
  assert.deepEqual(data.releases, []);
});

test("a corrupt earlier JSON is replaced by an empty one, and an empty release list keeps the old data", async () => {
  const outFile = await tempFile();
  await writeFile(outFile, "{not json");
  assert.equal((await quiet(() => sync({ get: async () => [], outFile }))).result, "empty");

  await quiet(() => sync({ get: async () => [release("v1.0.0", "### ✨ Features\n* a thing")], outFile }));
  const before = await readFile(outFile, "utf8");
  const { result } = await quiet(() => sync({ get: async () => [release("dev-latest", "", { prerelease: true })], outFile }));
  assert.equal(result, "kept");
  assert.equal(await readFile(outFile, "utf8"), before);
});

test("a successful sync writes the filtered real notes", async () => {
  const outFile = await tempFile();
  const { result, stats } = await quiet(() => sync({ get: async (url) => (url.endsWith("page=1") ? FIXTURE : []), outFile }));
  assert.equal(result, "synced");
  const data = JSON.parse(await readFile(outFile, "utf8")) as ChangelogData;
  assert.equal(data.repo, "lumose-health/lumose");
  assert.equal(data.releases.length, REAL.releases.length);
  assert.equal(stats?.linesKept, REAL.stats.linesKept);
});
