import type { CanvasEngine } from "@canvas";

import type { ContextMenuContext, ContextMenuEntryItem } from "./context-menu-items.types";

/** Whether an entry can be picked: a command by its `enabled`, a submenu when it has entries. */
export function entryEnabled(
  item: ContextMenuEntryItem,
  context: ContextMenuContext,
  engine: CanvasEngine,
): boolean {
  if ("groups" in item) {
    return item.groups.some((group) => group.some((entry) => entryEnabled(entry, context, engine)));
  }
  if ("actions" in item) return item.actions(engine, context).length > 0;
  return item.enabled ? item.enabled(context, engine) : true;
}
