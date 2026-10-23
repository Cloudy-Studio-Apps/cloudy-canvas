import type { Rect } from "../geometry.types";
import type { PathShape } from "./path.types";
import { lineTo } from "./path-segments";

/** How far a quarter circle's control points sit from its ends, per unit of radius. */
const KAPPA = 0.5522847498;

/** A (rounded) box as one closed contour, clockwise from its top-left corner's end. */
export function rectPath({ x, y, w, h }: Rect, radius = 0): PathShape {
  if (w <= 0 || h <= 0) return { contours: [] };
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const k = r * KAPPA;
  const start = { x: x + r, y };
  const corner = (c1x: number, c1y: number, c2x: number, c2y: number, tx: number, ty: number) => ({
    c1: { x: c1x, y: c1y },
    c2: { x: c2x, y: c2y },
    to: { x: tx, y: ty },
  });
  const right = x + w;
  const bottom = y + h;
  const segments = [lineTo(start, { x: right - r, y })];
  if (r > 0) segments.push(corner(right - r + k, y, right, y + r - k, right, y + r));
  segments.push(lineTo({ x: right, y: y + r }, { x: right, y: bottom - r }));
  if (r > 0) segments.push(corner(right, bottom - r + k, right - r + k, bottom, right - r, bottom));
  segments.push(lineTo({ x: right - r, y: bottom }, { x: x + r, y: bottom }));
  if (r > 0) segments.push(corner(x + r - k, bottom, x, bottom - r + k, x, bottom - r));
  segments.push(lineTo({ x, y: bottom - r }, { x, y: y + r }));
  if (r > 0) segments.push(corner(x, y + r - k, x + r - k, y, x + r, y));
  else segments.push(lineTo({ x, y }, start));
  return { contours: [{ start, segments, closed: true }] };
}
