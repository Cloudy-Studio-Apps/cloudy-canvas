import type { Point } from "@canvas";

import type { ContextMenuContext, ContextMenuGroup } from "./context-menu-items.types";

/** An open context menu: where, which items, and what they read. */
export interface OpenContextMenu {
  at: Point;
  groups: readonly ContextMenuGroup[];
  context: ContextMenuContext;
}
