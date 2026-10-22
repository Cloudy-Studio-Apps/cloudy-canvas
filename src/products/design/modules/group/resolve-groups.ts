import {
  elementBounds,
  unionRects,
  type CanvasElement,
  type ElementKinds,
  type Rect,
} from "@canvas";

import { childrenByParent } from "../core";
import { isGroup } from "./group-tree";

/**
 * Groups' bounds wrap their children as they show (`resolveElements`, turned ones by the box
 * round them), nested groups included. A group itself never turns: its children do.
 */
export function resolveGroups(elements: CanvasElement[], kinds: ElementKinds): CanvasElement[] {
  if (!elements.some(isGroup)) return elements;
  const byId = new Map(elements.map((el) => [el.id, el]));
  const children = childrenByParent(elements);
  const resolved = new Map<string, Rect | null>();

  const boundsOf = (el: CanvasElement, depth: number): Rect | null => {
    if (!isGroup(el)) return elementBounds(kinds.kindOf(el), el);
    const known = resolved.get(el.id);
    if (known !== undefined) return known;
    resolved.set(el.id, null); // A loop resolves to nothing.
    const rects = (children.get(el.id) ?? [])
      .map((id) => byId.get(id))
      .filter((child) => child !== undefined)
      .map((child) => (depth > elements.length ? null : boundsOf(child, depth + 1)))
      .filter((rect) => rect !== null);
    const rect = unionRects(rects);
    resolved.set(el.id, rect);
    return rect;
  };

  return elements.map((el) => {
    const rect = isGroup(el) ? boundsOf(el, 0) : null;
    return rect ? { ...el, ...rect, rotation: 0 } : el;
  });
}
