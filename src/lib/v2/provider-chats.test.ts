import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PROVIDERS, PROVIDER_NOTICE_SUBJECT } from "../../data/providers";
import { CHAT_MESSAGES, WATCH_PEAK_BG } from "./demo-clock";

const chatText = (provider: (typeof PROVIDERS)[number]) =>
  [
    provider.chat.question,
    provider.chat.seen,
    ...provider.chat.points,
    provider.chat.mention,
    provider.chat.summary,
  ].join("\n");

// The same list the v2 check script scans the source with.
function bannedPattern() {
  const script = readFileSync("scripts/check-v2.sh", "utf8");
  const match = /^banned='([^']+)'$/m.exec(script);
  assert.ok(match, "the check script has a banned word list");
  return new RegExp(match[1], "i");
}

// Nothing about doses or settings, what comes next, or acting on the pump.
const OUT_OF_BOUNDS =
  /insulin|bolus|basal|dose|dosing|units?\b|carb|ratio|correction|\bisf\b|sensitivity|pump|control-iq|\bwill\b|going to|should|try |alert|notif|a1c|gmi|\bdays?\b|weeks?|months?|mmol/i;

test("every provider has a full sample chat", () => {
  for (const provider of PROVIDERS) {
    const { chat } = provider;
    for (const text of [chat.question, chat.seen, chat.mention, chat.summary]) {
      assert.ok(text.trim().length > 0, provider.id);
    }
    assert.ok(chat.points.length >= 1 && chat.points.length <= 2, provider.id);
  }
});

test("no two providers show the same question or answer", () => {
  assert.equal(
    new Set(PROVIDERS.map((p) => p.chat.question)).size,
    PROVIDERS.length,
  );
  assert.equal(
    new Set(PROVIDERS.map((p) => p.chat.seen)).size,
    PROVIDERS.length,
  );
});

test("sample chats pass the banned word list", () => {
  const banned = bannedPattern();
  for (const provider of PROVIDERS) {
    assert.doesNotMatch(chatText(provider), banned, provider.id);
  }
});

test("sample chats stay away from dosing, what comes next and long windows", () => {
  for (const provider of PROVIDERS) {
    assert.doesNotMatch(chatText(provider), OUT_OF_BOUNDS, provider.id);
  }
});

test("a window, when named, is the 6 hours the chat sees", () => {
  for (const provider of PROVIDERS) {
    for (const [, hours] of chatText(provider).matchAll(/(\d+) hours/g)) {
      assert.equal(hours, "6", provider.id);
    }
  }
});

test("glucose values are plausible, and none is an unremarked low", () => {
  for (const provider of PROVIDERS) {
    const answer = [provider.chat.seen, ...provider.chat.points].join(" ");
    // "70-180" is the range and "below 70" a threshold, not readings.
    const readings = answer
      .replace(/70-180|(above|below) \d+|about \d+|\d+ mg\/dL below/g, "")
      .matchAll(/\b(\d{2,3})\b(?!%| hours)/g);
    for (const [, value] of readings) {
      const mgdl = Number(value);
      assert.ok(mgdl >= 70 && mgdl <= 300, `${provider.id}: ${value}`);
    }
  }
});

test("the lunch peak matches the device demos", () => {
  const phone = CHAT_MESSAGES.map((message) => message.content).join(" ");
  assert.ok(phone.includes(`peaked ${WATCH_PEAK_BG}`));
  const lunch = PROVIDERS.filter((p) => /lunch/.test(chatText(p)));
  assert.ok(lunch.length > 0);
  for (const provider of lunch) {
    assert.ok(chatText(provider).includes(String(WATCH_PEAK_BG)), provider.id);
  }
});

test("only one button rotates, and it opens on Ollama", () => {
  const rotating = PROVIDERS.filter((p) => p.rotatingNames);
  assert.equal(rotating.length, 1);
  const names = rotating[0].rotatingNames ?? [];
  assert.equal(names[0], "Ollama");
  assert.ok(names.length >= 4 && names.length <= 5);
  assert.equal(new Set(names).size, names.length);
  // Its stable name is not one of the names it rotates through.
  assert.ok(!names.includes(rotating[0].name));
});

test("the notice names every fixed provider and covers the rest", () => {
  for (const provider of PROVIDERS) {
    const shown = provider.rotatingNames?.[0] ?? provider.name;
    assert.ok(PROVIDER_NOTICE_SUBJECT.includes(shown), shown);
  }
  assert.match(PROVIDER_NOTICE_SUBJECT, /and other product names and logos$/);
});
