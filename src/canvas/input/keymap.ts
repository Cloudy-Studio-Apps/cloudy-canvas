import { formatShortcut, matchesShortcut, type Shortcut } from "@shared/core";

import type { Keybindings } from "./keymap.types";

/**
 * A product's key bindings: command id → shortcuts. The first shortcut of each command is the one
 * shown in the UI. It's the single source for shortcuts; hosts read labels with `label()`.
 */
export class Keymap {
  private readonly entries: [string, readonly Shortcut[]][];

  constructor(private readonly bindings: Keybindings) {
    this.entries = Object.entries(bindings);
  }

  commandFor(event: KeyboardEvent): string | undefined {
    return this.entries.find(([, shortcuts]) =>
      shortcuts.some((s) => matchesShortcut(event, s)),
    )?.[0];
  }

  /** Label for a command's primary shortcut, e.g. "Ctrl Z". */
  label(command: string): string | undefined {
    const shortcut = this.bindings[command]?.[0];
    return shortcut ? formatShortcut(shortcut) : undefined;
  }
}
