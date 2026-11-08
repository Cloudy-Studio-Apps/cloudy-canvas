import {
  toUnrotated,
  type CanvasElement,
  type ElementKinds,
  type Point,
  type SelectTargetRequest,
} from "@canvas";

import type { SelectRedirect } from "../../../design-points.types";

import { DesignNodeKind, isDesignNode } from "../node";
import { enclosingHosts } from "./host-tree";

/**
 * What a click selects (`selectTarget`), as in Figma: the outermost group or boolean round what's
 * hit that hasn't been entered, where one is entered while something inside it is selected; a
 * double-click (`enter`) goes one level further in, Ctrl/Cmd+click (`deep`) to what's hit.
 * A module's redirect (`designSelectRedirects`) answers first, except for Ctrl/Cmd+click.
 * A press on the background of a top-level node holding layers (a frame's body) picks nothing
 * (`null`), so it starts a selection box, as in Figma, unless that node is selected.
 */
export function hostSelectTarget(
  hitId: string,
  request: SelectTargetRequest,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  redirects: readonly SelectRedirect[] = [],
): string | null {
  const { selection, deep, enter } = request;
  if (request.world && onBackground(hitId, request.world, request.selection, elements, kinds)) {
    return null;
  }
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

/** Whether `world` is on the background of `id`, a top-level node holding layers, not selected. */
function onBackground(
  id: string,
  world: Point,
  selection: ReadonlySet<string>,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): boolean {
  if (selection.has(id)) return false;
  const el = elements.find((other) => other.id === id);
  if (!el || !isDesignNode(el) || el.parentId !== null) return false;
  const kind = kinds.kindOf(el);
  if (!(kind instanceof DesignNodeKind) || !kind.backgroundAt(el, toUnrotated(world, el))) {
    return false;
  }
  return elements.some((other) => isDesignNode(other) && other.parentId === id);
}
