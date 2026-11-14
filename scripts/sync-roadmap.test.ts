import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { GitHubError } from "./sync-releases";
import { cleanLine, parseRoadmap, sync, type RoadmapData, type TextFetcher } from "./sync-roadmap";

// The real roadmap from lumose-health/.github, saved with `npx tsx scripts/sync-roadmap.ts --save-fixture`.
const FIXTURE = readFileSync(path.join(__dirname, "fixtures", "roadmap.md"), "utf8");
const REAL = parseRoadmap(FIXTURE);
const REAL_JSON = JSON.stringify({ lead: REAL.lead, phases: REAL.phases });
const phase = (id: string) => REAL.phases.find((p) => p.id === id);
const titles = () => REAL.phases.flatMap((p) => p.items.map((i) => i.title));
// Read from scripts/check-v2.sh, so these tests follow any change to its scan.
const CHECK_V2_BANNED = (() => {
  const m = readFileSync(path.join(__dirname, "check-v2.sh"), "utf8").match(/^banned='([^']+)'$/m);
  if (!m) throw new Error("banned= pattern not found in scripts/check-v2.sh");
  return new RegExp(m[1], "i");
})();

const doc = (...lines: string[]) => ["---", "title: Roadmap", "---", "", ...lines].join("\n");

test("the fixture is the real roadmap", () => {
  assert.ok(FIXTURE.length > 20_000);
  assert.match(FIXTURE, /^## Current State -- Foundation \(Delivered\)$/m);
  assert.match(FIXTURE, /^### Predictive Analytics$/m);
  assert.deepEqual(
    REAL.phases.map((p) => p.label),
    ["Ongoing", "Phase 1", "Phase 2", "Phase 3", "Phase 4"]
  );
});

test("AC1: only phase titles, focus lines and item titles are kept", () => {
  for (const p of REAL.phases) {
    assert.deepEqual(Object.keys(p).sort(), ["focus", "id", "items", "label", "title"]);
    for (const i of p.items) assert.deepEqual(Object.keys(i).sort(), ["inDevelopment", "title"]);
  }
  assert.equal(phase("phase-1")?.title, "Stability & Trust");
  assert.equal(
    phase("phase-1")?.focus,
    "Harden the platform, build community confidence, and establish legal and organizational foundations."
  );
  assert.ok(titles().includes("AI Engine 2.0"));
  assert.ok(titles().includes("Meal Intelligence — Vision Carb Estimation"));
  // Sections that aren't phases are left out.
  for (const name of ["Vision", "Guiding Principles", "How to Get Involved"]) {
    assert.ok(REAL.dropped.some((d) => d.kind === "phase" && d.text === name && d.reason === "not-a-phase"));
  }
  // The lead is the source's own line.
  assert.match(REAL.lead ?? "", /^Phases below are sequenced, not scheduled\./);
});

test("AC2: bullets and body text are never published, and Delivered is left out", () => {
  const bulletsAndBody = FIXTURE.split("\n").filter((l) => /^\s*[-*]\s|^[A-Z]/.test(l) && l.length > 40);
  assert.ok(bulletsAndBody.length > 50);
  for (const l of bulletsAndBody) {
    const text = cleanLine(l.replace(/^\s*[-*]\s+/, ""));
    if (text === REAL.lead) continue;
    assert.ok(!REAL_JSON.includes(JSON.stringify(text).slice(1, -1)), `published: ${text}`);
  }
  assert.ok(!/delivered|threshold-based alerting/i.test(REAL_JSON));
  assert.ok(!REAL.phases.some((p) => /current state/i.test(p.label)));
  assert.ok(REAL.dropped.some((d) => d.reason === "delivered"));
  // Delivered's ### items must not leak into the phase before or after it.
  for (const t of ["Platform", "Mobile & Wearable", "Infrastructure & Governance"]) assert.ok(!titles().includes(t));

  const parsed = parseRoadmap(
    doc("## Phase 1 -- A", "**Focus:** F.", "- a bullet", "Body text.", "#### Deep heading", "### Item", "  - nested")
  );
  assert.deepEqual(parsed.phases[0].items, [{ title: "Item", inDevelopment: false }]);
  assert.ok(!JSON.stringify(parsed.phases).includes("bullet"));

  // A Delivered section after a kept phase, in any heading form, takes its items with it.
  for (const heading of [
    "## Current State (Delivered)",
    "  ## Current State (Delivered)",
    "# Delivered",
    "Current State (Delivered)\n---",
    "Current State (Delivered)\n===",
  ]) {
    const p = parseRoadmap(doc("## Phase 1 -- A", "### Kept", heading, "### Delivered Item", "## Phase 2 -- B", "### Next"));
    assert.deepEqual(
      p.phases.map((ph) => ph.items.map((i) => i.title)),
      [["Kept"], ["Next"]],
      heading
    );
  }
});

test("titles and focus lines that make safety claims are dropped", () => {
  assert.match(FIXTURE, /^### Platform Safety Enforcement Layer$/m);
  assert.ok(!titles().includes("Platform Safety Enforcement Layer"));
  assert.ok(
    REAL.dropped.some(
      (d) => d.kind === "item" && d.text === "Platform Safety Enforcement Layer" && d.reason === "safety-claim"
    )
  );
  assert.ok(!/safety enforcement|safety layer/i.test(REAL_JSON));

  const parsed = parseRoadmap(
    doc(
      "## Phase 1 -- A",
      "**Focus:** Add safety enforcement to plugins.",
      "### Safety Enforcement",
      "### AI Guardrails",
      "### Kept",
      "## Phase 2 -- Safety Layer",
      "### Hidden under a dropped phase"
    )
  );
  assert.deepEqual(parsed.phases.map((p) => p.label), ["Phase 1"]);
  assert.equal(parsed.phases[0].focus, null);
  assert.deepEqual(parsed.phases[0].items, [{ title: "Kept", inDevelopment: false }]);
  assert.equal(parsed.dropped.filter((d) => d.reason === "safety-claim").length, 4);
});

test("titles and focus lines that suggest dosing settings are dropped", () => {
  // Nothing in the real roadmap is of this kind.
  assert.ok(!REAL.dropped.some((d) => d.reason === "dosing-advice"));

  const parsed = parseRoadmap(
    doc(
      "*Suggested ISF changes, sequenced, not scheduled.*",
      "## Phase 1 -- A",
      "**Focus:** Recommend correction factor changes from recent data.",
      "### Carb Ratio Suggestions",
      "### Carb Ratio Display",
      "## Phase 2 -- Insulin Sensitivity Recommendations",
      "### Hidden under a dropped phase"
    )
  );
  assert.equal(parsed.lead, null);
  assert.deepEqual(parsed.phases.map((p) => p.label), ["Phase 1"]);
  assert.equal(parsed.phases[0].focus, null);
  assert.deepEqual(parsed.phases[0].items, [{ title: "Carb Ratio Display", inDevelopment: false }]);
  assert.deepEqual(
    parsed.dropped.filter((d) => d.reason === "dosing-advice").map((d) => d.kind).sort(),
    ["focus", "item", "lead", "phase"]
  );
});

test("AC3: titles and focus lines with banned words are dropped", () => {
  assert.ok(!titles().includes("Predictive Analytics"));
  assert.equal(phase("phase-4")?.focus, null);
  assert.ok(REAL.dropped.some((d) => d.kind === "item" && d.text === "Predictive Analytics" && d.reason === "banned"));
  assert.ok(REAL.dropped.some((d) => d.kind === "focus" && /proactive prediction/.test(d.text)));
  assert.ok(!CHECK_V2_BANNED.test(REAL_JSON));

  const parsed = parseRoadmap(
    doc(
      "## Phase 1 -- A",
      "**Focus:** Ship a Telegram bot.",
      "### Telegram Channel",
      "### Forecasting",
      "### Push Notifications",
      "### Tele-gram",
      "### Kept",
      "## Phase 2 -- Glucose Prediction",
      "### Hidden under a dropped phase"
    )
  );
  assert.deepEqual(parsed.phases.map((p) => p.id), ["phase-1"]);
  assert.equal(parsed.phases[0].focus, null);
  assert.deepEqual(parsed.phases[0].items.map((i) => i.title), ["Kept"]);
});

test("AC4: GlycemicGPT reads Lumose", () => {
  assert.equal(phase("phase-3")?.focus, "Bring Lumose to iOS and establish official app store presence.");
  assert.ok(!/glycemic/i.test(REAL_JSON));
  assert.equal(cleanLine("GlycemicGPT and Glycemic GPT and glycemicgpt"), "Lumose and Lumose and Lumose");
});

test("AC5: alert and escalation items carry the in-development pill", () => {
  const flagged = REAL.phases.flatMap((p) => p.items.filter((i) => i.inDevelopment).map((i) => i.title));
  assert.deepEqual(flagged, ["Multi-Session Caregiver Escalation"]);
  const parsed = parseRoadmap(doc("## Phase 1 -- A", "### Smarter Alerts", "### Escalation Paths", "### Reports"));
  assert.deepEqual(
    parsed.phases[0].items.map((i) => i.inDevelopment),
    [true, true, false]
  );
});

test("strings are plain text: markdown, HTML and links are removed", () => {
  const parsed = parseRoadmap(
    doc(
      "*Sequenced, **not** scheduled.*",
      "## Phase 1 -- <b>Bold</b> [Link](https://evil.example) `code`",
      "**Focus:** Do <script>alert(1)</script>things https://evil.example/x",
      "### <img src=x onerror=alert(1)>Item **one**",
      "### <!-- note --> Two www.evil.example ftp://x.example/y",
      "### Three <!-- unclosed",
      "### " + "x".repeat(500)
    )
  );
  const p = parsed.phases[0];
  assert.equal(parsed.lead, "Sequenced, not scheduled.");
  assert.equal(p.title, "Bold Link code");
  assert.ok(!/[<>]|:\/\/|www\./.test(JSON.stringify(parsed)));
  assert.deepEqual(p.items.slice(0, 3).map((i) => i.title), ["Item one", "Two", "Three"]);
  assert.ok(p.items[3].title.length <= 120);
});

test("fenced code, a second focus line and duplicate phases are ignored", () => {
  const parsed = parseRoadmap(
    doc("## Phase 1 -- A", "**Focus:** First.", "**Focus:** Second.", "```", "### Not an item", "```", "## Phase 1 -- Again")
  );
  assert.equal(parsed.phases.length, 1);
  assert.equal(parsed.phases[0].focus, "First.");
  assert.deepEqual(parsed.phases[0].items, []);
});

async function tmpOut(content?: string): Promise<string> {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "roadmap-")), "roadmap.json");
  if (content !== undefined) await writeFile(file, content);
  return file;
}
const failing: TextFetcher = async (url) => {
  throw new GitHubError(403, url);
};
const quiet = <T>(fn: () => Promise<T>) => {
  const { warn, log } = console;
  console.warn = console.log = () => {};
  return fn().finally(() => Object.assign(console, { warn, log }));
};

test("AC6: when GitHub fails, the last JSON stays in place", async () => {
  const prev: RoadmapData = {
    generatedAt: "2026-01-01T00:00:00.000Z",
    source: { repo: "lumose-health/.github", path: "docs/roadmap.md", url: "https://example.invalid" },
    lead: null,
    phases: [{ id: "phase-1", label: "Phase 1", title: "Old", focus: null, items: [] }],
  };
  const out = await tmpOut(JSON.stringify(prev));
  assert.equal((await quiet(() => sync({ get: failing, outFile: out }))).result, "kept");
  assert.deepEqual(JSON.parse(await readFile(out, "utf8")), prev);

  // A doc with no phases counts as a failure too.
  assert.equal((await quiet(() => sync({ get: async () => "# Nothing here", outFile: out }))).result, "kept");
  assert.deepEqual(JSON.parse(await readFile(out, "utf8")), prev);
});

test("AC6: with no earlier JSON, an empty file is written", async () => {
  for (const content of [undefined, "not json"]) {
    const out = await tmpOut(content);
    assert.equal((await quiet(() => sync({ get: failing, outFile: out }))).result, "empty");
    const data = JSON.parse(await readFile(out, "utf8")) as RoadmapData;
    assert.deepEqual(data.phases, []);
    assert.equal(data.lead, null);
  }
});

test("a successful sync writes the parsed fixture", async () => {
  const out = await tmpOut();
  const res = await quiet(() => sync({ get: async () => FIXTURE, outFile: out }));
  assert.equal(res.result, "synced");
  const data = JSON.parse(await readFile(out, "utf8")) as RoadmapData;
  assert.deepEqual(data.phases, REAL.phases);
  assert.ok(!CHECK_V2_BANNED.test(JSON.stringify(data)));
});
