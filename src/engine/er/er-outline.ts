import type { ErShape } from "../document";
import type { Point } from "../geometry.types";

/** Where a line from the shape's center toward `toward` leaves its outline. */
export function outlinePoint(shape: ErShape, toward: Point): Point {
  const cx = shape.x + shape.w / 2;
  const cy = shape.y + shape.h / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = shape.w / 2;
  const hh = shape.h / 2;
  let t: number;
  if (shape.type === "er-attribute") {
    t = 1 / Math.hypot(dx / hw, dy / hh);
  } else if (shape.type === "er-relation") {
    t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
  } else {
    t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  }
  return { x: cx + dx * t, y: cy + dy * t };
}

export function shapeCenter(shape: ErShape): Point {
  return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
}
