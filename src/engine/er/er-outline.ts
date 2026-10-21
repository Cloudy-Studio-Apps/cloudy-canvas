import type { ErShape } from "../document";
import type { Point } from "../geometry.types";
import { LOLLIPOP_SIZE } from "./er-size";

/** The point lines aim at: the middle of the shape, a lollipop's circle, a triangle's centroid. */
export function shapeCenter(shape: ErShape): Point {
  if (shape.type === "er-attribute" && shape.look === "lollipop") {
    return { x: shape.x + shape.w / 2, y: shape.y + shape.h - LOLLIPOP_SIZE / 2 };
  }
  if (shape.type === "er-isa") return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 3 };
  return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
}

/** Where a line from the shape's center toward `toward` leaves its outline. */
export function outlinePoint(shape: ErShape, toward: Point): Point {
  const c = shapeCenter(shape);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const hw = shape.w / 2;
  const hh = shape.h / 2;
  let t: number;
  if (shape.type === "er-attribute" && shape.look === "lollipop") {
    t = LOLLIPOP_SIZE / 2 / Math.hypot(dx, dy);
  } else if (shape.type === "er-attribute") {
    t = 1 / Math.hypot(dx / hw, dy / hh);
  } else if (shape.type === "er-relation") {
    t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
  } else if (shape.type === "er-isa") {
    t = rayToPolygon(c, dx, dy, trianglePoints(shape));
  } else {
    t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  }
  return { x: c.x + dx * t, y: c.y + dy * t };
}

/** A hierarchy's triangle, pointing down, in world coordinates. */
export function trianglePoints(shape: ErShape): Point[] {
  return [
    { x: shape.x, y: shape.y },
    { x: shape.x + shape.w, y: shape.y },
    { x: shape.x + shape.w / 2, y: shape.y + shape.h },
  ];
}

/** Smallest t > 0 where origin + t·(dx, dy) crosses the polygon's edges. */
function rayToPolygon(origin: Point, dx: number, dy: number, polygon: readonly Point[]): number {
  let best = Infinity;
  polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length]!;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-9) return;
    const t = ((a.x - origin.x) * ey - (a.y - origin.y) * ex) / denom;
    const u = ((a.x - origin.x) * dy - (a.y - origin.y) * dx) / denom;
    if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t);
  });
  return Number.isFinite(best) ? best : 0;
}
