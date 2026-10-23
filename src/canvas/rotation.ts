import type { Point, Rect } from "./geometry.types";

const DEGREES = Math.PI / 180;

/**
 * `p` turned by `degrees` around `origin`: counterclockwise on screen for positive angles (y points
 * down), as a design's `rotation` is.
 */
export function rotatePoint(p: Point, origin: Point, degrees: number): Point {
  if (!degrees) return p;
  const a = degrees * DEGREES;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: origin.x + dx * cos + dy * sin, y: origin.y - dx * sin + dy * cos };
}

/**
 * A world point in the unrotated frame of an element turned by `rotation` around its top-left
 * corner (x, y): where it would be if the element weren't rotated (nor `mirrored` inside its box).
 */
export function toUnrotated(
  p: Point,
  el: { x: number; y: number; w?: number; rotation?: number; mirrored?: boolean },
): Point {
  const q = el.rotation ? rotatePoint(p, el, -el.rotation) : p;
  return el.mirrored ? { x: 2 * el.x + (el.w ?? 0) - q.x, y: q.y } : q;
}

/** The corners of `rect` turned by `degrees` around its top-left corner, clockwise from it. */
export function rotatedCorners(rect: Rect, degrees: number): Point[] {
  const { x, y, w, h } = rect;
  const corners = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
  return degrees ? corners.map((p) => rotatePoint(p, rect, degrees)) : corners;
}

/** The axis-aligned box round `rect` turned by `degrees` around its top-left corner. */
export function rotatedBounds(rect: Rect, degrees: number): Rect {
  return rotatedBoundsAround(rect, rect, degrees);
}

/** The axis-aligned box round `rect` turned by `degrees` around `origin`. */
export function rotatedBoundsAround(rect: Rect, origin: Point, degrees: number): Rect {
  if (!degrees) return rect;
  const { x, y, w, h } = rect;
  const corners = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ].map((p) => rotatePoint(p, origin, degrees));
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
}

/** Whether `p` lies in `rect` turned by `degrees` around its top-left corner (± `padding`). */
export function pointInRotatedRect(p: Point, rect: Rect, degrees: number, padding = 0): boolean {
  const q = degrees ? rotatePoint(p, rect, -degrees) : p;
  return (
    q.x >= rect.x - padding &&
    q.x <= rect.x + rect.w + padding &&
    q.y >= rect.y - padding &&
    q.y <= rect.y + rect.h + padding
  );
}

/** An angle in degrees, in (-180, 180], without float noise past 1/100°. */
export function normalizeAngle(degrees: number): number {
  let a = degrees % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return Math.round(a * 100) / 100 || 0;
}

/** The angle (degrees, counterclockwise on screen) of the direction from `origin` to `p`. */
export function angleOf(p: Point, origin: Point): number {
  return Math.atan2(origin.y - p.y, p.x - origin.x) / DEGREES;
}
