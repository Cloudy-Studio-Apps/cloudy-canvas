import { STROKE_DEFAULTS } from "./stroke.defaults";

/**
 * Cleans up a hand-drawn stroke: drops points that stray less than `tolerance` from the line
 * (Ramer–Douglas–Peucker), then rounds the corners left (Chaikin). The ends stay where they are.
 */
export function smoothPoints(points: number[], tolerance: number): number[] {
  if (points.length < 6) return points;
  let smoothed = simplify(points, tolerance);
  for (let pass = 0; pass < STROKE_DEFAULTS.smoothPasses; pass++) smoothed = cutCorners(smoothed);
  return smoothed;
}

function simplify(points: number[], tolerance: number): number[] {
  const count = points.length / 2;
  const keep = new Uint8Array(count);
  keep[0] = 1;
  keep[count - 1] = 1;
  const stack: [number, number][] = [[0, count - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    let farthest = -1;
    let max = tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = distanceToSegment(points, i, first, last);
      if (d > max) {
        max = d;
        farthest = i;
      }
    }
    if (farthest < 0) continue;
    keep[farthest] = 1;
    stack.push([first, farthest], [farthest, last]);
  }
  const out: number[] = [];
  for (let i = 0; i < count; i++) if (keep[i]) out.push(points[i * 2]!, points[i * 2 + 1]!);
  return out;
}

function distanceToSegment(points: number[], i: number, a: number, b: number): number {
  const px = points[i * 2]!;
  const py = points[i * 2 + 1]!;
  const ax = points[a * 2]!;
  const ay = points[a * 2 + 1]!;
  const dx = points[b * 2]! - ax;
  const dy = points[b * 2 + 1]! - ay;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** One Chaikin pass: each inner corner is replaced by two points a quarter along its sides. */
function cutCorners(points: number[]): number[] {
  if (points.length < 6) return points;
  const out = [points[0]!, points[1]!];
  for (let i = 0; i + 3 < points.length; i += 2) {
    const ax = points[i]!;
    const ay = points[i + 1]!;
    const bx = points[i + 2]!;
    const by = points[i + 3]!;
    out.push(
      ax * 0.75 + bx * 0.25,
      ay * 0.75 + by * 0.25,
      ax * 0.25 + bx * 0.75,
      ay * 0.25 + by * 0.75,
    );
  }
  out.push(points[points.length - 2]!, points[points.length - 1]!);
  return out;
}
