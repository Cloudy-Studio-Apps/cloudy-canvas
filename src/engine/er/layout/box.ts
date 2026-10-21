import type { Point, Rect, Size } from "../../geometry.types";

/** The rect of a box of `size` centered on `center`, grown by `margin` on every side. */
export function boxAt(center: Point, size: Size, margin = 0): Rect {
  return {
    x: center.x - size.w / 2 - margin,
    y: center.y - size.h / 2 - margin,
    w: size.w + margin * 2,
    h: size.h + margin * 2,
  };
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function angleTo(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}
