import type { Shortcut } from "@shared/core";

export interface ShortcutRow {
  command: string;
  label: string;
  shortcuts: readonly Shortcut[];
}

export interface ShortcutGroup {
  title: string;
  rows: ShortcutRow[];
}
