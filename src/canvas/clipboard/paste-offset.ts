import { rectsIntersect } from "../geometry";
import type { Point, Rect } from "../geometry.types";

/** How far each paste of the same elements lands from the previous one (world units). */
export const PASTE_STEP = 20;

/**
 * Where pasted elements go: `count` steps down-right of where they were copied while that place
 * is in view, otherwise centered in the view.
 */
export function pasteOffset(bounds: Rect | null, visible: Rect, count: number): Point {
  if (!bounds) return { x: 0, y: 0 };
  if (rectsIntersect(bounds, visible)) return { x: PASTE_STEP * count, y: PASTE_STEP * count };
  return {
    x: Math.round(visible.x + visible.w / 2 - (bounds.x + bounds.w / 2)),
    y: Math.round(visible.y + visible.h / 2 - (bounds.y + bounds.h / 2)),
  };
}

/** The offset that centers `bounds` on `at`. */
export function centerOffset(bounds: Rect | null, at: Point): Point {
  if (!bounds) return { x: 0, y: 0 };
  return {
    x: Math.round(at.x - (bounds.x + bounds.w / 2)),
    y: Math.round(at.y - (bounds.y + bounds.h / 2)),
  };
}
