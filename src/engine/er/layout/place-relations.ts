import type { ErRelationShape } from "../../document";
import type { Point, Size } from "../../geometry.types";
import type { ErShapes } from "../lang";
import { angleTo } from "./box";
import { LINK_LENGTH } from "./layout-metrics";
import type { Centers } from "./layout.types";

const SIDES = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
/** Distance between diamonds that link the same entities. */
const PARALLEL_GAP = 36;

/**
 * Places relation diamonds that aren't in `centers` yet: between their entities, or beside the
 * entity on its freest side when only one entity takes part (unary relations).
 */
export function placeRelations(shapes: ErShapes, centers: Centers): void {
  const pending = shapes.relations.filter((r) => !centers.has(r.id));
  const entityIds = (r: ErRelationShape) =>
    [...new Set(r.participants.map((p) => p.entityId))].filter((id) => centers.has(id));
  const samePair = new Map<string, number>();
  for (const relation of shapes.relations) {
    if (centers.has(relation.id)) samePair.set(pairKey(entityIds(relation)), 1);
  }

  for (const relation of pending.filter((r) => entityIds(r).length >= 2)) {
    const ids = entityIds(relation);
    const points = ids.map((id) => centers.get(id)!);
    const mid = average(points);
    const pair = pairKey(ids);
    const count = samePair.get(pair) ?? 0;
    samePair.set(pair, count + 1);
    centers.set(relation.id, offsetAcross(mid, points, count, relation));
  }

  for (const relation of pending.filter((r) => entityIds(r).length === 1)) {
    const entityId = entityIds(relation)[0]!;
    const entity = shapes.entities.find((e) => e.id === entityId);
    const center = centers.get(entityId)!;
    const used = linkAngles(entityId, shapes, centers);
    const side = freestSide(used);
    const reach =
      Math.abs(Math.cos(side)) * ((entity?.w ?? 0) / 2 + relation.w / 2) +
      Math.abs(Math.sin(side)) * ((entity?.h ?? 0) / 2 + relation.h / 2) +
      LINK_LENGTH;
    centers.set(relation.id, {
      x: center.x + Math.cos(side) * reach,
      y: center.y + Math.sin(side) * reach,
    });
  }

  // Relations without entities wait in a row under everything else.
  const loose = pending.filter((r) => entityIds(r).length === 0);
  if (loose.length === 0) return;
  const bottom = Math.max(0, ...[...centers.values()].map((p) => p.y)) + LINK_LENGTH * 3;
  loose.forEach((relation, i) => {
    centers.set(relation.id, { x: i * (relation.w + LINK_LENGTH), y: bottom });
  });
}

/** Directions of the lines already leaving an entity. */
export function linkAngles(entityId: string, shapes: ErShapes, centers: Centers): number[] {
  const from = centers.get(entityId);
  if (!from) return [];
  return shapes.relations
    .filter((r) => r.participants.some((p) => p.entityId === entityId))
    .map((r) => centers.get(r.id))
    .filter((p): p is Point => p !== undefined)
    .map((p) => angleTo(from, p));
}

function freestSide(used: readonly number[]): number {
  let best = SIDES[0]!;
  let bestGap = -1;
  for (const side of SIDES) {
    const gap = Math.min(Math.PI, ...used.map((a) => angleDistance(a, side)));
    if (gap > bestGap + 1e-6) {
      bestGap = gap;
      best = side;
    }
  }
  return best;
}

export function angleDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
}

/**
 * The n-th diamond between the same entities moves sideways (0, +1, -1, +2, … steps), each step
 * the diamond's extent in that direction plus a gap.
 */
function offsetAcross(mid: Point, points: readonly Point[], n: number, size: Size): Point {
  if (n === 0 || points.length < 2) return mid;
  const a = points[0]!;
  const b = points[1]!;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  const step = Math.abs(nx) * size.w + Math.abs(ny) * size.h + PARALLEL_GAP;
  const k = Math.ceil(n / 2) * (n % 2 === 1 ? 1 : -1);
  return { x: mid.x + nx * k * step, y: mid.y + ny * k * step };
}

function average(points: readonly Point[]): Point {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function pairKey(ids: readonly string[]): string {
  return [...ids].sort().join("|");
}
