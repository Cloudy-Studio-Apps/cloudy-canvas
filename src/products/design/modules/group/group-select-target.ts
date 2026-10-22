import type { CanvasElement, SelectTargetRequest } from "@canvas";

import { isDesignNode } from "../core";
import { enclosingGroups } from "./group-tree";

/**
 * What a click selects (`selectTarget`), as in Figma: the outermost group around what's hit that
 * hasn't been entered, where a group is entered while something inside it is selected; a
 * double-click (`enter`) goes one level further in, Ctrl/Cmd+click (`deep`) to what's hit.
 */
export function groupSelectTarget(
  hitId: string,
  { selection, deep, enter }: SelectTargetRequest,
  elements: readonly CanvasElement[],
): string {
  if (deep) return hitId;
  const byId = new Map(elements.map((el) => [el.id, el]));
  const levels = [...enclosingGroups(hitId, byId), hitId];
  if (levels.length === 1) return hitId;

  const entered = new Set<string>();
  for (const id of selection) {
    let el = byId.get(id);
    while (el && isDesignNode(el) && el.parentId && !entered.has(el.parentId)) {
      entered.add(el.parentId);
      el = byId.get(el.parentId);
    }
  }
  let level = 0;
  while (level < levels.length - 1 && entered.has(levels[level]!)) level++;
  if (enter && level < levels.length - 1) level++;
  return levels[level]!;
}
