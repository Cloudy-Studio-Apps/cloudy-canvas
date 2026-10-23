import { Fragment } from "react";

import { DropdownMenuSeparator } from "@shared/ui/components/ui/dropdown-menu";
import { ContextMenuCategoryEntry } from "./context-menu-category-entry";
import { ContextMenuEntry } from "./context-menu-entry";
import type { ContextMenuGroupsProps } from "./context-menu-entry.types";
import { ContextMenuSubmenuEntry } from "./context-menu-submenu-entry";

/** Groups of context menu entries, separated by lines; used by the menu and its submenus. */
export function ContextMenuGroups({ groups, context }: ContextMenuGroupsProps) {
  return groups.map((group, i) => (
    <Fragment key={i}>
      {i > 0 && <DropdownMenuSeparator />}
      {group.map((item) =>
        "groups" in item ? (
          <ContextMenuCategoryEntry key={item.id} item={item} context={context} />
        ) : "actions" in item ? (
          <ContextMenuSubmenuEntry key={item.id} item={item} context={context} />
        ) : (
          <ContextMenuEntry key={item.command} item={item} context={context} />
        ),
      )}
    </Fragment>
  ));
}
