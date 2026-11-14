/** The parts of a keydown event the "/" shortcut looks at. */
export interface ShortcutKeyEvent {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  defaultPrevented: boolean;
  isComposing: boolean;
  repeat: boolean;
}

/** The parts of the focused element the "/" shortcut looks at. */
export interface ShortcutTarget {
  tagName: string;
  isContentEditable: boolean;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** True for an element where "/" is text the reader means to type. */
export function isTypingTarget(target: ShortcutTarget | null): boolean {
  if (!target) return false;
  return (
    target.isContentEditable || TYPING_TAGS.has(target.tagName.toUpperCase())
  );
}

/**
 * Whether a keydown should open docs search. Shift is allowed because several
 * keyboard layouts only reach "/" with it. Ctrl, Alt and Meta are not, so
 * browser and system shortcuts keep working.
 */
export function shouldOpenSearch(
  event: ShortcutKeyEvent,
  target: ShortcutTarget | null,
  dialogOpen: boolean,
): boolean {
  if (event.key !== "/") return false;
  if (event.defaultPrevented || event.isComposing || event.repeat) return false;
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  if (dialogOpen) return false;
  return !isTypingTarget(target);
}

// Anything open that should keep "/" to itself: a modal (the search dialog, a
// zoomed image) or the sidebar drawer on narrow screens.
export const OPEN_OVERLAYS = [
  '[role="dialog"]',
  '[role="alertdialog"]',
  "dialog[open]",
  '#nd-sidebar-mobile[data-state="open"]',
];

/** True while a modal or the sidebar drawer is open. */
export function hasOpenOverlay(root: {
  querySelector(selector: string): unknown;
}): boolean {
  return root.querySelector(OPEN_OVERLAYS.join(", ")) !== null;
}

/**
 * Where focus goes when search closes: back to what opened it. If that is no
 * longer visible (the header swaps its search control at 760px), the search
 * control that is visible now, and failing that the given fallback.
 */
export function pickFocusTarget<T>(
  opener: T | null,
  controls: readonly T[],
  fallback: T | null,
  isVisible: (element: T) => boolean,
): T | null {
  if (opener !== null && isVisible(opener)) return opener;
  return controls.find(isVisible) ?? fallback;
}
