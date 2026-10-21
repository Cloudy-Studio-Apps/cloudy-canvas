import type { ContextMenuContext, ContextMenuItem } from "./context-menu-items.types";

export interface ContextMenuEntryProps {
  item: ContextMenuItem;
  context: ContextMenuContext;
}
