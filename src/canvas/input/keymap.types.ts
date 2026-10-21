import type { Shortcut } from "@shared/core";

/** Command id → its shortcuts, primary first. Tool commands are `tool.<tool id>`. */
export type Keybindings = Readonly<Record<string, readonly Shortcut[]>>;
