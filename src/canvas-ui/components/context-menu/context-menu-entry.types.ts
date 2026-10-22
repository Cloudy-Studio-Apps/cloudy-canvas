import type {
  ContextMenuContext,
  ContextMenuItem,
  ContextMenuSubmenu,
} from "./context-menu-items.types";

export interface ContextMenuEntryProps {
  item: ContextMenuItem;
  context: ContextMenuContext;
}

export interface ContextMenuSubmenuEntryProps {
  item: ContextMenuSubmenu;
  context: ContextMenuContext;
}
