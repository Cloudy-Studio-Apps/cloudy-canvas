import type { ElementSide, Point, Rect } from "@canvas";

/** Outward direction of each side. */
export const SIDE_DIRECTIONS: Record<ElementSide, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export const SIDES: readonly ElementSide[] = ["top", "right", "bottom", "left"];

/** The side of a box that faces `toward`, weighing the box's proportions. */
export function facingSide(box: Rect, toward: Point): ElementSide {
  const dx = (toward.x - (box.x + box.w / 2)) / Math.max(box.w, 1);
  const dy = (toward.y - (box.y + box.h / 2)) / Math.max(box.h, 1);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}

export function centerOf({ x, y, w, h }: Rect): Point {
  return { x: x + w / 2, y: y + h / 2 };
}
