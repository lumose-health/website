import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isTypingTarget,
  shouldOpenSearch,
  type ShortcutKeyEvent,
  type ShortcutTarget,
} from "./search-shortcut";

function key(overrides: Partial<ShortcutKeyEvent> = {}): ShortcutKeyEvent {
  return {
    key: "/",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    defaultPrevented: false,
    isComposing: false,
    repeat: false,
    ...overrides,
  };
}

function element(tagName: string, isContentEditable = false): ShortcutTarget {
  return { tagName, isContentEditable };
}

test("slash opens search from the page body, a link or a button", () => {
  assert.equal(shouldOpenSearch(key(), element("BODY"), false), true);
  assert.equal(shouldOpenSearch(key(), element("A"), false), true);
  assert.equal(shouldOpenSearch(key(), element("BUTTON"), false), true);
  assert.equal(shouldOpenSearch(key(), null, false), true);
});

test("slash types normally inside editable fields", () => {
  for (const tag of ["INPUT", "TEXTAREA", "SELECT", "input", "textarea"]) {
    assert.equal(shouldOpenSearch(key(), element(tag), false), false, tag);
  }
  assert.equal(shouldOpenSearch(key(), element("DIV", true), false), false);
});

test("other keys never open search", () => {
  for (const other of ["k", "?", "Enter", "\\", "Divide"]) {
    assert.equal(
      shouldOpenSearch(key({ key: other }), element("BODY"), false),
      false,
      other,
    );
  }
});

test("slash with Ctrl, Alt or Meta is left to the browser", () => {
  for (const modifier of ["altKey", "ctrlKey", "metaKey"] as const) {
    assert.equal(
      shouldOpenSearch(key({ [modifier]: true }), element("BODY"), false),
      false,
      modifier,
    );
  }
});

test("slash does nothing while a dialog is open", () => {
  assert.equal(shouldOpenSearch(key(), element("BODY"), true), false);
  assert.equal(shouldOpenSearch(key(), element("BUTTON"), true), false);
});

test("handled, composing and held-down keys are ignored", () => {
  const body = element("BODY");
  assert.equal(shouldOpenSearch(key({ defaultPrevented: true }), body, false), false);
  assert.equal(shouldOpenSearch(key({ isComposing: true }), body, false), false);
  assert.equal(shouldOpenSearch(key({ repeat: true }), body, false), false);
});

test("isTypingTarget covers fields and editable regions only", () => {
  assert.equal(isTypingTarget(element("INPUT")), true);
  assert.equal(isTypingTarget(element("SPAN", true)), true);
  assert.equal(isTypingTarget(element("MAIN")), false);
  assert.equal(isTypingTarget(null), false);
});
