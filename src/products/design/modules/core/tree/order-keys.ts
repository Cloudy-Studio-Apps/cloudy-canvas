import type { CanvasElement } from "@canvas";

import { isDesignNode, layoutOf } from "../node";

/** Joins a parent's key and a child's index; below every index character, so parents sort first. */
const SEPARATOR = " ";

/**
 * The design's drawing order (`CanvasProduct.orderKeys`): each node's key is its ancestors'
 * indexes then its own, so a parent draws before its children and siblings keep their `index`
 * order (reversed in an auto layout drawn first on top). A parent that's missing (or a loop)
 * puts the node at the top of the page.
 */
export function treeOrderKeys(elements: readonly CanvasElement[]): Map<string, string> {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const keys = new Map<string, string>();
  const reversed = reversedSegments(elements, byId);

  const keyOf = (el: CanvasElement, visiting: Set<string>): string => {
    const known = keys.get(el.id);
    if (known !== undefined) return known;
    const parent = isDesignNode(el) && el.parentId ? byId.get(el.parentId) : undefined;
    visiting.add(el.id);
    const key =
      parent && !visiting.has(parent.id)
        ? `${keyOf(parent, visiting)}${SEPARATOR}${reversed.get(el.id) ?? el.index}`
        : el.index;
    keys.set(el.id, key);
    return key;
  };

  for (const el of elements) keyOf(el, new Set());
  return keys;
}

/**
 * The key segments of the children of auto layout frames that draw their first layer on top
 * (`reverseStacking`): their rank from the last, all as wide, so they sort backwards.
 */
function reversedSegments(
  elements: readonly CanvasElement[],
  byId: ReadonlyMap<string, CanvasElement>,
): Map<string, string> {
  const children = new Map<string, CanvasElement[]>();
  for (const el of elements) {
    if (!isDesignNode(el) || !el.parentId) continue;
    if (!layoutOf(byId.get(el.parentId))?.reverseStacking) continue;
    const list = children.get(el.parentId);
    if (list) list.push(el);
    else children.set(el.parentId, [el]);
  }
  const segments = new Map<string, string>();
  for (const list of children.values()) {
    list.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
    const width = String(list.length).length;
    list.forEach((el, i) => segments.set(el.id, String(list.length - 1 - i).padStart(width, "0")));
  }
  return segments;
}
