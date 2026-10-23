import type {
  ContextMenuCategory,
  ContextMenuContext,
  ContextMenuGroup,
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

export interface ContextMenuCategoryEntryProps {
  item: ContextMenuCategory;
  context: ContextMenuContext;
}

export interface ContextMenuGroupsProps {
  groups: readonly ContextMenuGroup[];
  context: ContextMenuContext;
}
