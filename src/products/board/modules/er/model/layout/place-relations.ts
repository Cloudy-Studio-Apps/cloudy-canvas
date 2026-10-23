import type { Point, Rect, Size } from "@canvas";

import type { ErElement } from "../../base/er.types";
import type { ErRelationElement } from "../../relation/relation.types";
import type { ErShapes } from "../lang";
import { angleTo, boxAt, overlaps } from "./box";
import { erShapeMap } from "./er-graph";
import { segmentHitsRect } from "./obstacles";
import { LINK_LENGTH } from "./layout-metrics";
import type { Centers } from "./layout.types";

const SIDES = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
/** Distance between diamonds that link the same entities. */
const PARALLEL_GAP = 36;
/** How many steps to each side a diamond tries before keeping the midpoint. */
const MAX_SIDESTEPS = 8;
/** Room kept round a diamond when looking for a clear spot. */
const CLEARANCE = 8;
/** An aggregation box's room round its entities, roughly (attributes included). */
const AGGREGATE_MARGIN = 40;

/**
 * Places relation diamonds that aren't in `centers` yet: between their entities, or beside the
 * entity on its freest side when only one entity takes part (unary relations).
 */
export function placeRelations(shapes: ErShapes, centers: Centers): void {
  const pending = shapes.relations.filter((r) => !centers.has(r.id));
  const entityIds = (r: ErRelationElement) =>
    [...new Set(r.participants.map((p) => p.entityId))].filter((id) => centers.has(id));
  const samePair = new Map<string, number>();
  for (const relation of shapes.relations) {
    if (centers.has(relation.id)) samePair.set(pairKey(entityIds(relation)), 1);
  }

  const sizes = erShapeMap(shapes);
  const boxes = aggregateAreas(shapes, centers);
  for (const relation of pending.filter((r) => entityIds(r).length >= 2)) {
    const ids = entityIds(relation);
    const points = ids.map((id) => centers.get(id)!);
    const mid = average(points);
    const pair = pairKey(ids);
    const count = samePair.get(pair) ?? 0;
    samePair.set(pair, count + 1);
    // Off to the side of the midpoint when the diamond or its lines would cross other shapes.
    // Nor inside an aggregation box it isn't part of (its own relation, or a side of it).
    const foreign = boxes.filter(
      (b) =>
        b.relationId !== relation.id && !relation.participants.some((p) => p.entityId === b.id),
    );
    const conflicts = (at: Point) =>
      conflictsAt(at, relation, ids, centers, sizes) +
      foreign.filter((b) => overlaps(b.rect, boxAt(at, relation))).length;
    // The first clear spot from the midpoint outwards, else the one with the fewest conflicts.
    const tries = Array.from({ length: MAX_SIDESTEPS * 2 + 1 }, (_, k) =>
      offsetAcross(mid, points, count + k * 2, relation),
    );
    let best = tries[0]!;
    let fewest = Infinity;
    for (const at of tries) {
      const n = conflicts(at);
      if (n < fewest) {
        fewest = n;
        best = at;
      }
      if (n === 0) break;
    }
    centers.set(relation.id, best);
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

/**
 * How many placed shapes a diamond at `at` touches and its lines to `ids` pass through (other
 * entities and diamonds); 0 is clear.
 */
function conflictsAt(
  at: Point,
  relation: Size & { id: string },
  ids: readonly string[],
  centers: Centers,
  shapes: ReadonlyMap<string, ErElement>,
): number {
  const box = boxAt(at, relation, CLEARANCE);
  let count = 0;
  for (const [id, center] of centers) {
    const shape = shapes.get(id);
    if (
      !shape ||
      id === relation.id ||
      (shape.type !== "er-entity" && shape.type !== "er-relation")
    ) {
      continue;
    }
    const rect = boxAt(center, shape);
    if (overlaps(rect, box)) count++;
    if (ids.includes(id)) continue;
    count += ids.filter((target) => segmentHitsRect(at, centers.get(target)!, rect)).length;
  }
  return count;
}

/** Where each aggregation's box will roughly be: round its relation's placed entities. */
function aggregateAreas(
  shapes: ErShapes,
  centers: Centers,
): { id: string; relationId: string; rect: Rect }[] {
  const byId = erShapeMap(shapes);
  return shapes.aggregates.flatMap((aggregate) => {
    const relation = shapes.relations.find((r) => r.id === aggregate.relationId);
    const rects = (relation?.participants ?? []).flatMap((p) => {
      const at = centers.get(p.entityId);
      const shape = byId.get(p.entityId);
      return at && shape ? [boxAt(at, shape, AGGREGATE_MARGIN)] : [];
    });
    if (rects.length < 2) return [];
    const x = Math.min(...rects.map((r) => r.x));
    const y = Math.min(...rects.map((r) => r.y));
    const w = Math.max(...rects.map((r) => r.x + r.w)) - x;
    const h = Math.max(...rects.map((r) => r.y + r.h)) - y;
    return [{ id: aggregate.id, relationId: aggregate.relationId, rect: { x, y, w, h } }];
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
