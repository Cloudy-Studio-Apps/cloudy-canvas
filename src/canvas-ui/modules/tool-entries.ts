import type { CanvasEngine } from "@canvas";

import type { PlacedToolEntry, ToolbarItem, ToolEntry, ToolInfo } from "./editor-points.types";

/** The tools on the toolbar, in their groups, each sorted, lowest group first. */
export function toolbarGroups(entries: readonly ToolEntry[]): PlacedToolEntry[][] {
  const groups = new Map<number, PlacedToolEntry[]>();
  for (const entry of entries) {
    if (!entry.toolbar) continue;
    const placed = entry as PlacedToolEntry;
    const group = groups.get(placed.toolbar.group);
    if (group) group.push(placed);
    else groups.set(placed.toolbar.group, [placed]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group.sort((a, b) => a.toolbar.order - b.toolbar.order));
}

/** A toolbar group's buttons: tools sharing a `menu` become one item where the first one is. */
export function toolbarItems(group: readonly PlacedToolEntry[]): ToolbarItem[] {
  const items: ToolbarItem[] = [];
  const menus = new Map<string, PlacedToolEntry[]>();
  for (const entry of group) {
    const menu = entry.toolbar.menu;
    if (!menu) {
      items.push(entry);
      continue;
    }
    const entries = menus.get(menu);
    if (entries) entries.push(entry);
    else {
      const list = [entry];
      menus.set(menu, list);
      items.push({ menu, entries: list });
    }
  }
  return items;
}

/** Every tool in the order lists show them: the toolbar's first, then the others. */
export function sortedTools(entries: readonly ToolEntry[]): ToolEntry[] {
  return [...toolbarGroups(entries).flat(), ...entries.filter((entry) => !entry.toolbar)];
}

/** Whether a tool is listed in the library (see `ToolEntry.library`). */
export function inLibrary(entry: ToolEntry): boolean {
  return entry.library !== false && (entry.library !== undefined || "element" in entry);
}

/**
 * A tool's name and description: its element kind's, or its own. An element tool whose kind
 * isn't registered falls back to the element type.
 */
export function toolInfo(entry: ToolEntry, engine: Pick<CanvasEngine, "elementInfo">): ToolInfo {
  if (!("element" in entry)) return { label: entry.label, description: entry.description };
  const info = engine.elementInfo(entry.element);
  return { label: info?.label ?? entry.element, description: info?.description };
}
