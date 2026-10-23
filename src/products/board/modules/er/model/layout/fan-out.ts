import type { Point, Size } from "@canvas";

import { boxAt } from "./box";
import { fanAngles } from "./fan-angles";
import { RING_GAP } from "./layout-metrics";
import type { Obstacles } from "./layout.types";
import { conflictCount } from "./obstacles";

const PUSH_STEP = 12;
const MAX_PUSHES = 14;
/** Small turns tried before pushing an attribute further out. */
const TURNS = [0, 1, -1, 2, -2, 3, -3].map((k) => (k * 9 * Math.PI) / 180);
/** When the fan's direction is crowded, every direction round the owner is tried, close in first. */
const SWEEP = Array.from(
  { length: 24 },
  (_, k) => (Math.ceil(k / 2) * (k % 2 ? 1 : -1) * Math.PI) / 12,
);
const SWEEP_PUSHES = 6;
const CLEARANCE = 6;

/**
 * Places items (attributes) around an owner box, fanned out over the free directions between the
 * `blocked` angles (its lines). Each item sits just outside the owner; when that spot is taken it
 * turns a little, then tries every direction round the owner at that distance, and only then
 * moves further out, until it touches no box or line in `obstacles`, which grows as items are
 * placed.
 */
export function fanOut(
  owner: Point & Size,
  items: readonly (Size & { id: string })[],
  blocked: readonly number[],
  obstacles: Obstacles,
): Map<string, Point> {
  const result = new Map<string, Point>();
  const ownerBox = boxAt(owner, owner);
  const angles = fanAngles(items.length, blocked);
  items.forEach((item, i) => {
    const base = angles[i] ?? 0;
    let chosen: Point | null = null;
    // With no free spot, the one that touches the fewest shapes and lines, nearest first.
    let fallback: { at: Point; conflicts: number } | null = null;
    const tryAt = (angle: number, push: number) => {
      const center = ringPoint(owner, item, angle, push * PUSH_STEP);
      const conflicts = conflictCount(
        boxAt(center, item, CLEARANCE),
        [owner, center],
        obstacles,
        ownerBox,
      );
      if (conflicts === 0) chosen = center;
      else if (!fallback || conflicts < fallback.conflicts) fallback = { at: center, conflicts };
      return conflicts === 0;
    };
    // Close to the owner first: its fan direction, then every direction round it, before moving
    // a step further out (an attribute far from its owner reads as someone else's).
    for (let push = 0; push <= MAX_PUSHES && !chosen; push++) {
      if (TURNS.some((turn) => tryAt(base + turn, push))) break;
      if (push <= SWEEP_PUSHES) SWEEP.some((turn) => tryAt(base + turn, push));
    }
    const center: Point =
      chosen ?? (fallback as { at: Point } | null)?.at ?? ringPoint(owner, item, base, 0);
    result.set(item.id, center);
    obstacles.rects.push(boxAt(center, item));
    obstacles.segments.push([owner, center]);
  });
  return result;
}

/** Center of an item just outside the owner box in direction `angle`, plus `extra` further out. */
function ringPoint(owner: Point & Size, item: Size, angle: number, extra: number): Point {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const tx = Math.abs(dx) > 1e-6 ? (owner.w / 2 + item.w / 2 + RING_GAP) / Math.abs(dx) : Infinity;
  const ty = Math.abs(dy) > 1e-6 ? (owner.h / 2 + item.h / 2 + RING_GAP) / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty) + extra;
  return { x: owner.x + dx * t, y: owner.y + dy * t };
}
