import { formatShortcut, matchesShortcut, type Shortcut } from "@shared/core";

import type { Keybindings } from "./keymap.types";

/**
 * A product's key bindings: command id → shortcuts. The first shortcut of each command is the one
 * shown in the UI. It's the single source for shortcuts; hosts read labels with `label()`. A layer
 * (the current mode's own bindings, `setLayer`) is matched and labelled first.
 */
export class Keymap {
  private readonly entries: [string, readonly Shortcut[]][];
  private layer: Keybindings = {};
  private layerEntries: [string, readonly Shortcut[]][] = [];

  constructor(private readonly bindings: Keybindings) {
    this.entries = Object.entries(bindings);
  }

  /** Bindings that win over the product's while they're set (a mode's); `null` drops them. */
  setLayer(bindings: Keybindings | null): void {
    this.layer = bindings ?? {};
    this.layerEntries = Object.entries(this.layer);
  }

  commandFor(event: KeyboardEvent): string | undefined {
    const matches = ([, shortcuts]: [string, readonly Shortcut[]]) =>
      shortcuts.some((s) => matchesShortcut(event, s));
    return (this.layerEntries.find(matches) ?? this.entries.find(matches))?.[0];
  }

  /** Label for a command's primary shortcut, e.g. "Ctrl Z". */
  label(command: string): string | undefined {
    const shortcut = (this.layer[command] ?? this.bindings[command])?.[0];
    return shortcut ? formatShortcut(shortcut) : undefined;
  }
}
