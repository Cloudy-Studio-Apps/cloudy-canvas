import type { CanvasEngine } from "@canvas";

/** What the menu's items are enabled and labelled by, read when it opens. */
export interface ContextMenuContext {
  selectionCount: number;
  /** Every selected element is locked. */
  selectionLocked: boolean;
  /** Some element on the canvas is locked. */
  anyLocked: boolean;
  /** Copy properties took a look Paste properties can apply. */
  styleCopied: boolean;
}

/** One entry of the canvas context menu: an engine command. */
export interface ContextMenuItem {
  command: string;
  /** Defaults to the command's name in `BASE_COMMAND_LABELS`. */
  label?: string | ((context: ContextMenuContext) => string);
  enabled?: (context: ContextMenuContext) => boolean;
  destructive?: boolean;
}

/** An entry of a submenu, listed when the menu opens. */
export interface ContextMenuAction {
  label: string;
  run(): void;
}

/** An entry that opens a submenu of actions (e.g. the design's "Move to page"). */
export interface ContextMenuSubmenu {
  id: string;
  label: string;
  /** Its entries, read when the menu opens; with none, the entry is disabled. */
  actions(engine: CanvasEngine, context: ContextMenuContext): readonly ContextMenuAction[];
}

/** Items between separators. */
export type ContextMenuGroup = readonly (ContextMenuItem | ContextMenuSubmenu)[];
