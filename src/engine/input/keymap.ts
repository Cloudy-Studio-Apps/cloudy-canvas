import { formatShortcut, matchesShortcut, type Shortcut } from "@core";

import type { CommandId } from "../commands.types";

/** Default key bindings. The first shortcut of each command is the one shown in the UI. */
export const KEYMAP: Record<CommandId, readonly Shortcut[]> = {
  undo: [{ key: "z", mod: true }],
  redo: [
    { key: "z", mod: true, shift: true },
    { key: "y", mod: true },
  ],
  selectAll: [{ key: "a", mod: true }],
  deleteSelection: [
    { key: "Delete", label: "Del" },
    { key: "Backspace", label: "⌫" },
  ],
  editSelection: [{ key: "Enter", label: "↵" }],
  cancel: [{ key: "Escape", label: "Esc" }],
  zoomIn: [
    { key: "=", mod: true, label: "+" },
    { key: "+", mod: true },
    { key: "+", mod: true, shift: true },
  ],
  zoomOut: [{ key: "-", mod: true, label: "−" }],
  zoomReset: [{ key: "0", mod: true }],
  zoomToFit: [{ code: "Digit1", shift: true, label: "1" }],
  save: [{ key: "s", mod: true }],
  saveAs: [{ key: "s", mod: true, shift: true }],
  "tool.select": [{ key: "v" }],
  "tool.hand": [{ key: "h" }],
  "tool.marker": [{ key: "m" }],
  "tool.sticky": [{ key: "s" }],
  "tool.shape": [{ key: "r" }],
};

const ENTRIES = Object.entries(KEYMAP) as [CommandId, readonly Shortcut[]][];

export function commandForEvent(event: KeyboardEvent): CommandId | undefined {
  return ENTRIES.find(([, shortcuts]) => shortcuts.some((s) => matchesShortcut(event, s)))?.[0];
}

/** Label for a command's primary shortcut, e.g. "Ctrl Z". */
export function shortcutLabel(command: CommandId): string | undefined {
  const shortcut = KEYMAP[command][0];
  return shortcut ? formatShortcut(shortcut) : undefined;
}
