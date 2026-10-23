import { isModKey } from "@shared/core";

import type { TextStyleShortcut } from "../../elements";

/** The style shortcut a key press is (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Shift+X), if any. */
export function styleShortcutOf(event: KeyboardEvent): TextStyleShortcut | null {
  if (!isModKey(event) || event.altKey) return null;
  const key = event.key.toLowerCase();
  if (key === "b" && !event.shiftKey) return "bold";
  if (key === "i" && !event.shiftKey) return "italic";
  if (key === "u" && !event.shiftKey) return "underline";
  if (key === "x" && event.shiftKey) return "strikethrough";
  return null;
}
