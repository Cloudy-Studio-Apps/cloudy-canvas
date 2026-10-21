/** What the menu's items are enabled and labelled by, read when it opens. */
export interface ContextMenuContext {
  selectionCount: number;
  /** Every selected element is locked. */
  selectionLocked: boolean;
  /** Some element on the canvas is locked. */
  anyLocked: boolean;
}

/** One entry of the canvas context menu: an engine command. */
export interface ContextMenuItem {
  command: string;
  /** Defaults to the command's name in `BASE_COMMAND_LABELS`. */
  label?: string | ((context: ContextMenuContext) => string);
  enabled?: (context: ContextMenuContext) => boolean;
  destructive?: boolean;
}

/** Items between separators. */
export type ContextMenuGroup = readonly ContextMenuItem[];
