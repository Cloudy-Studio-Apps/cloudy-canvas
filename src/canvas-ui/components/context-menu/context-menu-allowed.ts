import type { CanvasEngine } from "@canvas";

import type { ContextMenuEntryItem, ContextMenuGroup } from "./context-menu-items.types";

/**
 * The groups without what the engine's current mode doesn't run (`engine.allowsCommand`; a submenu
 * of actions counts by its id, so a mode that lists its commands leaves it out), dropping groups
 * and categories left empty.
 */
export function allowedGroups(
  groups: readonly ContextMenuGroup[],
  engine: CanvasEngine,
): ContextMenuGroup[] {
  return groups
    .map((group) => group.flatMap((item) => allowedItem(item, engine)))
    .filter((group) => group.length > 0);
}

function allowedItem(item: ContextMenuEntryItem, engine: CanvasEngine): ContextMenuEntryItem[] {
  if ("groups" in item) {
    const groups = allowedGroups(item.groups, engine);
    return groups.length > 0 ? [{ ...item, groups }] : [];
  }
  const command = "actions" in item ? item.id : item.command;
  return engine.allowsCommand(command) ? [item] : [];
}
