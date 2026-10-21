import type { Size } from "@canvas";

import type { Centers } from "./layout.types";

const MARGIN = 12;
const PASSES = 60;

/**
 * Pushes overlapping boxes apart along the axis where they overlap least. Only `movable` boxes
 * move; when both boxes are movable they share the push.
 */
export function resolveOverlaps(
  centers: Centers,
  sizes: ReadonlyMap<string, Size>,
  movable: ReadonlySet<string>,
): void {
  const ids = [...centers.keys()].filter((id) => sizes.has(id));
  for (let pass = 0; pass < PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]!;
        const b = ids[j]!;
        const moveA = movable.has(a);
        const moveB = movable.has(b);
        if (!moveA && !moveB) continue;
        if (separate(centers, sizes, a, b, moveA, moveB)) moved = true;
      }
    }
    if (!moved) return;
  }
}

function separate(
  centers: Centers,
  sizes: ReadonlyMap<string, Size>,
  a: string,
  b: string,
  moveA: boolean,
  moveB: boolean,
): boolean {
  const ca = centers.get(a)!;
  const cb = centers.get(b)!;
  const sa = sizes.get(a)!;
  const sb = sizes.get(b)!;
  const dx = cb.x - ca.x;
  const dy = cb.y - ca.y;
  const ox = (sa.w + sb.w) / 2 + MARGIN - Math.abs(dx);
  const oy = (sa.h + sb.h) / 2 + MARGIN - Math.abs(dy);
  if (ox <= 0 || oy <= 0) return false;

  const alongX = ox < oy;
  const amount = alongX ? ox : oy;
  const sign = (alongX ? dx : dy) >= 0 ? 1 : -1;
  const shareA = moveA && moveB ? 0.5 : moveA ? 1 : 0;
  const shareB = 1 - shareA;
  const push = (id: string, by: number) => {
    const c = centers.get(id)!;
    centers.set(id, alongX ? { x: c.x + by, y: c.y } : { x: c.x, y: c.y + by });
  };
  if (shareA) push(a, -sign * amount * shareA);
  if (shareB) push(b, sign * amount * shareB);
  return true;
}
