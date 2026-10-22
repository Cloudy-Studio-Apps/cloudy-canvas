import type { Point } from "@canvas";

/**
 * Points around a center at `radiusAt(i)` (0–1 of the box), starting at the top and going
 * clockwise, stretched to fill a `w`×`h` box exactly (like Figma's polygons and stars).
 */
export function pointsInBox(
  count: number,
  radiusAt: (i: number) => number,
  w: number,
  h: number,
): Point[] {
  const raw = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const r = radiusAt(i);
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;
  return raw.map((p) => ({ x: ((p.x - minX) / spanX) * w, y: ((p.y - minY) / spanY) * h }));
}

/** Whether `p` is inside the closed polygon (even-odd rule). */
export function pointInPolygon(points: readonly Point[], p: Point): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]!;
    const b = points[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Distance from `p` to the polygon's outline. */
export function distanceToOutline(points: readonly Point[], p: Point): number {
  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)),
    );
    best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
  }
  return best;
}
