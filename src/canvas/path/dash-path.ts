import { mod } from "../utils";
import { pointAt, subCurve } from "./bezier";
import type { CubicCurve, PathContour, PathShape } from "./path.types";
import { curveOf, lineTo, samePoint } from "./path-segments";

/** Samples per curve when measuring its length. */
const LENGTH_STEPS = 32;

/** The shortest dash drawn: zero-length dashes with round or square caps are dots. */
const MIN_DASH = 1e-3;

/**
 * A shape cut into dashes along its contours, as SVG and Figma dash a stroke: `pattern` is dash,
 * gap, dash, gap… lengths (an odd count repeats twice), started `offset` along each contour. The
 * dashes are open contours of the source curves' parts; a closed contour's last dash joins its
 * first when they meet at its start. An empty or all-zero pattern leaves the shape as it is.
 */
export function dashPath(shape: PathShape, pattern: readonly number[], offset = 0): PathShape {
  const dashes = dashLengths(pattern);
  if (!dashes) return shape;
  const contours: PathContour[] = [];
  for (const contour of shape.contours) contours.push(...dashContour(contour, dashes, offset));
  return { contours };
}

/** The pattern as dash/gap pairs, or `null` when it draws a solid line. */
function dashLengths(pattern: readonly number[]): number[] | null {
  const lengths = pattern.map((n) => (Number.isFinite(n) ? Math.max(0, n) : 0));
  if (lengths.length === 0) return null;
  const even = lengths.length % 2 === 0 ? lengths : [...lengths, ...lengths];
  // Gaps of nothing draw a solid line; dashes of nothing still draw dots.
  if (even.every((n, i) => i % 2 === 0 || n === 0)) return null;
  return even.map((n, i) => (i % 2 === 0 ? Math.max(n, MIN_DASH) : n));
}

function dashContour(contour: PathContour, dashes: number[], offset: number): PathContour[] {
  const curves = contourCurves(contour);
  const period = dashes.reduce((sum, n) => sum + n, 0);
  const out: PathContour[] = [];
  let index = 0;
  let left = mod(offset, period);
  while (left >= dashes[index]!) {
    left -= dashes[index]!;
    index = (index + 1) % dashes.length;
  }
  left = dashes[index]! - left;
  const startsOn = index % 2 === 0;
  let current: PathContour | null = null;

  for (const curve of curves) {
    const table = lengthTable(curve);
    const length = table[table.length - 1]!;
    let at = 0;
    while (at < length - 1e-9) {
      const step = Math.min(left, length - at);
      if (index % 2 === 0) {
        const piece = subCurve(curve, tAt(table, at), tAt(table, at + step));
        current ??= { start: piece[0], segments: [], closed: false };
        current.segments.push({ c1: piece[1], c2: piece[2], to: piece[3] });
      }
      at += step;
      left -= step;
      if (left <= 1e-9) {
        if (current) out.push(current);
        current = null;
        index = (index + 1) % dashes.length;
        left = dashes[index]!;
      }
    }
  }
  if (!current) return out;
  const [first] = out;
  // The dash running over a closed contour's start is one dash, not two.
  if (contour.closed && startsOn && first && first !== current) {
    out[0] = { ...current, segments: [...current.segments, ...first.segments] };
  } else {
    out.push(current);
  }
  return out;
}

/** A contour's curves, a closed one's closing line included when its last segment stops short. */
function contourCurves(contour: PathContour): CubicCurve[] {
  const curves: CubicCurve[] = [];
  let from = contour.start;
  for (const segment of contour.segments) {
    curves.push(curveOf(from, segment));
    from = segment.to;
  }
  if (contour.closed && !samePoint(from, contour.start)) {
    curves.push(curveOf(from, lineTo(from, contour.start)));
  }
  return curves;
}

/** Lengths along a curve at `LENGTH_STEPS` even steps of `t` (the last one is its length). */
function lengthTable(curve: CubicCurve): number[] {
  const table = [0];
  let previous = curve[0];
  for (let i = 1; i <= LENGTH_STEPS; i++) {
    const point = pointAt(curve, i / LENGTH_STEPS);
    table.push(table[i - 1]! + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
  }
  return table;
}

/** The `t` where a curve has run `length` along it (between the table's samples, linearly). */
function tAt(table: number[], length: number): number {
  const total = table[table.length - 1]!;
  if (length <= 0) return 0;
  if (length >= total) return 1;
  let low = 0;
  let high = table.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (table[middle]! < length) low = middle;
    else high = middle;
  }
  const span = table[high]! - table[low]!;
  const within = span > 0 ? (length - table[low]!) / span : 0;
  return (low + within) / LENGTH_STEPS;
}
