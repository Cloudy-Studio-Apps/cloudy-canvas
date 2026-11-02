import type { Shortcut } from "./keyboard.types";

export function isApplePlatform(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

export function isWindowsPlatform(): boolean {
  return typeof navigator !== "undefined" && /Win/.test(navigator.platform);
}

/** `navigator.platform` reads like Linux on Android, so this goes by the user agent. */
export function isAndroidPlatform(): boolean {
  return typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);
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

/**
 * True for the keys WebView2 acts on by itself (reload, print, find, …) when a page doesn't stop
 * them. Some are app shortcuts too (Ctrl+G groups), so a listener that skips default-prevented
 * events must still take these.
 */
export function isBrowserReservedKey(event: KeyboardEvent): boolean {
  if (event.key === "F3" || event.key === "F5" || event.key === "F7") return true;
  if (!event.ctrlKey || event.altKey) return false;
  return (event.shiftKey ? /^[gpr]$/ : /^[fgjpr]$/).test(event.key.toLowerCase());
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
