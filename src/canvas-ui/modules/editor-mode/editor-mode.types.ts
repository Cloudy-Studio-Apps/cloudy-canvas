import type { ComponentType } from "react";

import type { CanvasEngine, CanvasMode, CanvasPoints, HostCommand, ProductTool } from "@canvas";
import type { EditorPoints, ExtensionIcon } from "../editor-points.types";
import type { ModeToolbarEntry } from "../mode-toolbar.types";

/** A command a mode adds, with what it does. */
export interface ModeHostCommand extends HostCommand {
  /** Runs it; left out when one of the mode's `hooks` handles it (it needs React context). */
  run?: (engine: CanvasEngine) => void;
}

/**
 * The toolbar a mode shows instead of the main one: its items, a hook giving them (items that
 * depend on state), or a component of its own.
 */
export type ModeToolbarSpec =
  | readonly ModeToolbarEntry[]
  | { useItems: () => readonly ModeToolbarEntry[] }
  | { component: ComponentType };

/** A whole mode in one object: how the canvas behaves in it and what the editor shows. */
export interface EditorModeDefinition<O extends object> {
  id: string;
  /** Its name in the mode switcher and its toolbar's title. */
  label: string;
  description?: string;
  icon: ExtensionIcon;
  /** Place in the switcher, lowest first (the default mode is 0). */
  order: number;
  /** The tool it starts with, and the one Esc goes back to before leaving it. */
  tool: string;
  /** Tools registered with it. */
  tools?: readonly ProductTool<O>[];
  /** Other tools that work in it (e.g. `"hand"`); picking any other waits. */
  allowTools?: readonly string[];
  isolate?: CanvasMode["isolate"];
  faded?: CanvasMode["faded"];
  commands?: CanvasMode["commands"];
  keybindings?: CanvasMode["keybindings"];
  hostCommands?: readonly ModeHostCommand[];
  toolbar?: ModeToolbarSpec;
  /** DOM over the canvas, mounted only while the mode is on. */
  overlays?: readonly ComponentType[];
  /** Work on switching into it (not when an editor opens in another mode). */
  onEnter?: (engine: CanvasEngine) => void;
  /** Work on switching out of it. */
  onLeave?: (engine: CanvasEngine) => void;
  /** Session hooks that run for as long as the editor is open. */
  hooks?: readonly (() => void)[];
}

/** The points a product's modes are registered into. */
export interface ModePoints<O extends object> {
  canvas: CanvasPoints<O>;
  editor: EditorPoints;
}
