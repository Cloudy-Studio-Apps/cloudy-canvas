import type { Shortcut } from "./keyboard.types";

export function isApplePlatform(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

export function isModKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  if (shortcut.code !== undefined && event.code !== shortcut.code) return false;
  if (shortcut.key !== undefined && event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }
  return (
    isModKey(event) === Boolean(shortcut.mod) &&
    event.shiftKey === Boolean(shortcut.shift) &&
    event.altKey === Boolean(shortcut.alt)
  );
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
