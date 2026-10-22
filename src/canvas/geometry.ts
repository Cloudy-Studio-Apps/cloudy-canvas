import { clamp } from "./utils";
import type { Point, Rect, Size } from "./geometry.types";

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export function rectCenter({ x, y, w, h }: Rect): Point {
  return { x: x + w / 2, y: y + h / 2 };
}

export function rectContainsPoint(r: Rect, p: Point, padding = 0): boolean {
  return (
    p.x >= r.x - padding &&
    p.x <= r.x + r.w + padding &&
    p.y >= r.y - padding &&
    p.y <= r.y + r.h + padding
  );
}

/** Whether `inner` lies entirely inside `outer`. */
export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}

export function unionRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Squared distance from point p to segment ab. */
export function distanceToSegmentSq(p: Point, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : clamp(((p.x - ax) * dx + (p.y - ay) * dy) / lengthSq, 0, 1);
  const cx = ax + t * dx - p.x;
  const cy = ay + t * dy - p.y;
  return cx * cx + cy * cy;
}

/** Bounding box of a flat [x0, y0, x1, y1, …] point list. */
export function boundsOfPoints(points: number[]): Rect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i]!;
    const y = points[i + 1]!;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** The rect with every field rounded to whole world units. */
export function roundRect({ x, y, w, h }: Rect): Rect {
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/** The rect of anything with a position and size (e.g. an element), as a plain `Rect`. */
export function rectOf({ x, y, w, h }: Rect): Rect {
  return { x, y, w, h };
}

/**
 * Whether `p` is within `radius` of a polyline given as a flat [x0, y0, x1, y1, …] list relative
 * to `origin` (e.g. an element's `points`).
 */
export function nearPolyline(points: readonly number[], origin: Point, p: Point, radius: number) {
  const local = { x: p.x - origin.x, y: p.y - origin.y };
  const radiusSq = radius * radius;
  if (points.length === 2) {
    return distanceToSegmentSq(local, points[0]!, points[1]!, points[0]!, points[1]!) <= radiusSq;
  }
  for (let i = 0; i + 3 < points.length; i += 2) {
    const distance = distanceToSegmentSq(
      local,
      points[i]!,
      points[i + 1]!,
      points[i + 2]!,
      points[i + 3]!,
    );
    if (distance <= radiusSq) return true;
  }
  return false;
}

/** A point with whole coordinates. */
export function roundPoint({ x, y }: Point): Point {
  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * A `size` box centered in `view`, at its own size or shrunk (keeping proportions) to cover at
 * most `fraction` of the view; whole numbers, at least 1×1. E.g. a pasted image.
 */
export function fitInView(size: Size, view: Rect, fraction: number): Rect {
  const scale = Math.min(1, (view.w * fraction) / size.w, (view.h * fraction) / size.h);
  const w = Math.max(1, size.w * scale);
  const h = Math.max(1, size.h * scale);
  const center = rectCenter(view);
  return roundRect({ x: center.x - w / 2, y: center.y - h / 2, w, h });
}
