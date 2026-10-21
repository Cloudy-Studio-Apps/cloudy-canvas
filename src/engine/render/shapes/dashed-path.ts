import type { Graphics } from "pixi.js";

const DASH = 5;
const DASH_GAP = 4;

/** Adds a dashed path through the points (closed unless `closed` is false). */
export function dashed(g: Graphics, points: readonly number[], closed = true): void {
  const list = closed ? [...points, points[0]!, points[1]!] : [...points];
  let draw = true;
  let left = DASH;
  for (let i = 0; i + 3 < list.length; i += 2) {
    let ax = list[i]!;
    let ay = list[i + 1]!;
    const bx = list[i + 2]!;
    const by = list[i + 3]!;
    let segment = Math.hypot(bx - ax, by - ay);
    while (segment > 0) {
      const step = Math.min(left, segment);
      const t = step / segment;
      const nx = ax + (bx - ax) * t;
      const ny = ay + (by - ay) * t;
      if (draw) g.moveTo(ax, ay).lineTo(nx, ny);
      ax = nx;
      ay = ny;
      segment -= step;
      left -= step;
      if (left <= 1e-6) {
        draw = !draw;
        left = draw ? DASH : DASH_GAP;
      }
    }
  }
}
