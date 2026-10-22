import { distanceToSegmentSq } from "./geometry";

/**
 * Cleans up a hand-drawn line (a flat [x0, y0, x1, y1, …] list): drops points that stray less
 * than `tolerance` from the line (Ramer–Douglas–Peucker), then rounds the corners left (`passes`
 * of Chaikin). The ends stay where they are.
 */
export function smoothPoints(points: number[], tolerance: number, passes = 2): number[] {
  if (points.length < 6) return points;
  let smoothed = simplify(points, tolerance);
  for (let pass = 0; pass < passes; pass++) smoothed = cutCorners(smoothed);
  return smoothed;
}

function simplify(points: number[], tolerance: number): number[] {
  const count = points.length / 2;
  const keep = new Uint8Array(count);
  keep[0] = 1;
  keep[count - 1] = 1;
  const stack: [number, number][] = [[0, count - 1]];
  const at = (i: number) => ({ x: points[i * 2]!, y: points[i * 2 + 1]! });
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    const a = at(first);
    const b = at(last);
    let farthest = -1;
    let max = tolerance * tolerance;
    for (let i = first + 1; i < last; i++) {
      const d = distanceToSegmentSq(at(i), a.x, a.y, b.x, b.y);
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
