import type { Point, Size } from "@canvas";

import { boxAt, overlaps } from "./box";
import type { Centers } from "./layout.types";

const RING_STEP = 16;
const RINGS = 30;
const DIRECTIONS = 16;

/**
 * Moves each movable box still on top of a fixed one to the nearest spot clear of every fixed
 * box, preferring spots clear of everything. Pushing boxes apart one pair at a time can leave a
 * box stuck between two fixed ones (a new diamond between an entity's attributes).
 */
export function escapeFixed(
  centers: Centers,
  sizes: ReadonlyMap<string, Size>,
  movable: ReadonlySet<string>,
  margin: number,
): void {
  const ids = [...centers.keys()].filter((id) => sizes.has(id));
  const fixed = ids.filter((id) => !movable.has(id));
  for (const id of ids) {
    if (!movable.has(id)) continue;
    const size = sizes.get(id)!;
    const hits = (at: Point, others: readonly string[]) =>
      others.some(
        (other) =>
          other !== id &&
          overlaps(boxAt(at, size, margin), boxAt(centers.get(other)!, sizes.get(other)!)),
      );
    const start = centers.get(id)!;
    if (!hits(start, fixed)) continue;
    const spots = candidates(start);
    const best =
      spots.find((at) => !hits(at, ids)) ?? spots.find((at) => !hits(at, fixed)) ?? start;
    centers.set(id, best);
  }
}

/** Spots around `start`, nearest first. */
function candidates(start: Point): Point[] {
  const spots: Point[] = [];
  for (let ring = 1; ring <= RINGS; ring++) {
    for (let i = 0; i < DIRECTIONS; i++) {
      const angle = (i / DIRECTIONS) * Math.PI * 2;
      spots.push({
        x: Math.round(start.x + Math.cos(angle) * ring * RING_STEP),
        y: Math.round(start.y + Math.sin(angle) * ring * RING_STEP),
      });
    }
  }
  return spots;
}
