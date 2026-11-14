import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hasOpenOverlay,
  isTypingTarget,
  OPEN_OVERLAYS,
  pickFocusTarget,
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

// A document that only knows which selectors currently match something.
function documentWith(...matching: string[]) {
  return {
    querySelector(selector: string) {
      const parts = selector.split(", ");
      return parts.some((part) => matching.includes(part)) ? {} : null;
    },
  };
}

test("an open dialog or the open sidebar drawer counts as an overlay", () => {
  assert.equal(hasOpenOverlay(documentWith()), false);
  for (const selector of OPEN_OVERLAYS) {
    assert.equal(hasOpenOverlay(documentWith(selector)), true, selector);
  }
});

test("the drawer only counts while it is open", () => {
  assert.ok(OPEN_OVERLAYS.includes('#nd-sidebar-mobile[data-state="open"]'));
  assert.equal(hasOpenOverlay(documentWith("#nd-sidebar-mobile")), false);
  assert.equal(
    hasOpenOverlay(documentWith('#nd-sidebar-mobile[data-state="closed"]')),
    false,
  );
});

test("focus returns to the opener while it is visible", () => {
  const visible = (name: string) => name !== "hidden";
  assert.equal(pickFocusTarget("opener", ["a", "b"], "main", visible), "opener");
});

test("a hidden opener hands focus to the visible search control", () => {
  const visible = (name: string) => name === "mobile" || name === "main";
  assert.equal(
    pickFocusTarget("desktop", ["desktop", "mobile"], "main", visible),
    "mobile",
  );
});

test("with no visible control, focus goes to the fallback", () => {
  const visible = (name: string) => name === "main";
  assert.equal(pickFocusTarget("desktop", ["desktop"], "main", visible), "main");
  assert.equal(pickFocusTarget(null, [], "main", visible), "main");
  assert.equal(pickFocusTarget(null, [], null, visible), null);
});
