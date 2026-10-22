import type { ToolbarEntry } from "./editor-points.types";

/** The toolbar's entries in groups, each sorted, lowest group first. */
export function toolbarGroups(entries: readonly ToolbarEntry[]): ToolbarEntry[][] {
  const groups = new Map<number, ToolbarEntry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.group);
    if (group) group.push(entry);
    else groups.set(entry.group, [entry]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group.sort((a, b) => a.order - b.order));
}

/** The toolbar's entries in the order they're shown. */
export function sortedToolbar(entries: readonly ToolbarEntry[]): ToolbarEntry[] {
  return toolbarGroups(entries).flat();
}
