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
