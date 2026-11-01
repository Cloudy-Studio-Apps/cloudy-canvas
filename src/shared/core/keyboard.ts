import type { Shortcut } from "./keyboard.types";

export function isApplePlatform(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

export function isWindowsPlatform(): boolean {
  return typeof navigator !== "undefined" && /Win/.test(navigator.platform);
}

export function isModKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  if (shortcut.code !== undefined && event.code !== shortcut.code) return false;
  if (shortcut.key !== undefined && event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }
  // AltGr types a character: Windows reports it as Ctrl+Alt, which is neither `mod` nor `alt` here.
  const altGr = !isApplePlatform() && event.getModifierState("AltGraph");
  const mod = !altGr && isModKey(event);
  const alt = !altGr && event.altKey;
  // macOS has no AltGr: `[` on a Spanish keyboard is Option plus a key, with `key` already "[".
  const optionTyped = alt && !shortcut.alt && isApplePlatform() && isSymbolKey(shortcut.key);
  return (
    mod === Boolean(shortcut.mod) &&
    event.shiftKey === Boolean(shortcut.shift) &&
    (alt === Boolean(shortcut.alt) || optionTyped)
  );
}

/** Whether `key` is one character that isn't a letter or a digit, like `[`. */
function isSymbolKey(key: string | undefined): boolean {
  return key !== undefined && /^[^\p{L}\p{N}]$/u.test(key);
}

/** Human-readable label, e.g. "Ctrl ⇧ Z" or "⌘⇧Z". */
export function formatShortcut(shortcut: Shortcut, apple = isApplePlatform()): string {
  const parts: string[] = [];
  if (shortcut.mod) parts.push(apple ? "⌘" : "Ctrl");
  if (shortcut.alt) parts.push(apple ? "⌥" : "Alt");
  if (shortcut.shift) parts.push(apple ? "⇧" : "Shift");
  parts.push(shortcut.label ?? (shortcut.key ?? shortcut.code ?? "").toUpperCase());
  return parts.join(apple ? "" : " ");
}

/** True when keyboard input should go to a text field instead of app shortcuts. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

/** True for focused controls where Space has its own meaning (press a button, follow a link). */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("button, a, [role='menuitem']") !== null;
}
