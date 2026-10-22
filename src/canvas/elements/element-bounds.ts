import { rotatedBounds } from "../rotation";
import type { Rect } from "../geometry.types";
import type { ElementKind } from "./element.kind";
import type { CanvasElement } from "./element.types";

/**
 * Where an element shows: its kind's bounds, or the axis-aligned box round them when it's turned
 * (`rotation`). Hits, marquees, snapping, arranging, culling and exports read this; resizing reads
 * the kind's own (unturned) bounds.
 */
export function elementBounds(kind: ElementKind, el: CanvasElement): Rect {
  const bounds = kind.bounds(el);
  return el.rotation ? rotatedBounds({ ...bounds, x: el.x, y: el.y }, el.rotation) : bounds;
}
