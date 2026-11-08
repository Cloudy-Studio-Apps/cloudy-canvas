import type { Shortcut } from "@shared/core";

/** The player's own keys, matched and labelled from here (the editor's wait while it's open). */
export const PLAYER_KEYS = {
  back: { key: "ArrowLeft", alt: true, label: "←" },
  restart: { key: "r" },
  hints: { key: "h" },
  close: { key: "Escape", label: "Esc" },
} as const satisfies Record<string, Shortcut>;
