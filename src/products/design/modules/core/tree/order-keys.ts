import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../node";

/** Joins a parent's key and a child's index; below every index character, so parents sort first. */
const SEPARATOR = " ";

/**
 * The design's drawing order (`CanvasProduct.orderKeys`): each node's key is its ancestors'
 * indexes then its own, so a parent draws before its children and siblings keep their `index`
 * order. A parent that's missing (or a loop) puts the node at the top of the page.
 */
export function treeOrderKeys(elements: readonly CanvasElement[]): Map<string, string> {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const keys = new Map<string, string>();

  const keyOf = (el: CanvasElement, visiting: Set<string>): string => {
    const known = keys.get(el.id);
    if (known !== undefined) return known;
    const parent = isDesignNode(el) && el.parentId ? byId.get(el.parentId) : undefined;
    visiting.add(el.id);
    const key =
      parent && !visiting.has(parent.id)
        ? `${keyOf(parent, visiting)}${SEPARATOR}${el.index}`
        : el.index;
    keys.set(el.id, key);
    return key;
  };

  for (const el of elements) keyOf(el, new Set());
  return keys;
}
