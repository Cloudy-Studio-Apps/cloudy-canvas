import type { CanvasElement, ElementKinds, SelectTargetRequest } from "@canvas";

import type { SelectRedirect } from "../../../design-points.types";

import { isDesignNode } from "../node";
import { enclosingHosts } from "./host-tree";

/**
 * What a click selects (`selectTarget`), as in Figma: the outermost group or boolean round what's
 * hit that hasn't been entered, where one is entered while something inside it is selected; a
 * double-click (`enter`) goes one level further in, Ctrl/Cmd+click (`deep`) to what's hit.
 * A module's redirect (`designSelectRedirects`) answers first, except for Ctrl/Cmd+click.
 */
export function hostSelectTarget(
  hitId: string,
  { selection, deep, enter }: SelectTargetRequest,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  redirects: readonly SelectRedirect[] = [],
): string {
  if (deep) return hitId;
  for (const redirect of redirects) {
    const target = redirect(hitId, elements);
    if (target !== null) return target;
  }
  const byId = new Map(elements.map((el) => [el.id, el]));
  const levels = [...enclosingHosts(hitId, byId, kinds), hitId];
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
