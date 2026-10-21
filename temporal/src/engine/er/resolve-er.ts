import {
  ER_AGGREGATE_TITLE_H,
  type ErAggregateShape,
  type ErConstraintShape,
  type ErShape,
  type Shape,
} from "../document";
import { unionRects } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import { shapeBounds } from "../hit-test";
import { constraintPoints } from "./constraint-points";

/** Space between an aggregation's box and what it holds; the top also fits its name. */
const AGGREGATE_PADDING = 18;
const CONSTRAINT_PADDING = 4;

/**
 * Replaces aggregations and constraints with copies whose geometry follows the shapes they're
 * about: an aggregation's box wraps its relation, the relation's participants and their
 * attributes; a constraint's `points` run between its relations. Other shapes are returned as is.
 */
export function resolveErShapes(shapes: readonly Shape[]): Shape[] {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  const ownerOf = new Map<string, string[]>();
  for (const shape of shapes) {
    if (shape.type !== "er-attribute") continue;
    const list = ownerOf.get(shape.ownerId) ?? [];
    list.push(shape.id);
    ownerOf.set(shape.ownerId, list);
  }
  const resolved = new Map<string, Shape>();
  // Two passes, so an aggregation can hold a relation that takes part with another aggregation.
  for (let pass = 0; pass < 2; pass++) {
    for (const shape of shapes) {
      if (shape.type !== "er-aggregate") continue;
      const next = resolveAggregate(shape, (id) => resolved.get(id) ?? byId.get(id), ownerOf);
      resolved.set(shape.id, next);
    }
  }
  const lookup = (id: string) => resolved.get(id) ?? byId.get(id);
  for (const shape of shapes) {
    if (shape.type === "er-constraint") resolved.set(shape.id, resolveConstraint(shape, lookup));
  }
  return shapes.map((shape) => resolved.get(shape.id) ?? shape);
}

function resolveAggregate(
  aggregate: ErAggregateShape,
  get: (id: string) => Shape | undefined,
  ownerOf: ReadonlyMap<string, string[]>,
): ErAggregateShape {
  const relation = get(aggregate.relationId);
  if (relation?.type !== "er-relation") return aggregate;
  const members = new Set<string>([relation.id]);
  for (const p of relation.participants) members.add(p.entityId);
  // Attributes of the members (and of their composite attributes) are inside the box too.
  const queue = [...members];
  while (queue.length) {
    for (const id of ownerOf.get(queue.shift()!) ?? []) {
      if (!members.has(id)) {
        members.add(id);
        queue.push(id);
      }
    }
  }
  const rects = [...members].flatMap((id) => {
    const shape = get(id);
    return shape && shape.id !== aggregate.id ? [shapeBounds(shape)] : [];
  });
  const bounds = unionRects(rects);
  if (!bounds) return aggregate;
  return {
    ...aggregate,
    x: bounds.x - AGGREGATE_PADDING,
    y: bounds.y - AGGREGATE_PADDING - ER_AGGREGATE_TITLE_H,
    w: bounds.w + AGGREGATE_PADDING * 2,
    h: bounds.h + AGGREGATE_PADDING * 2 + ER_AGGREGATE_TITLE_H,
  };
}

function resolveConstraint(
  constraint: ErConstraintShape,
  get: (id: string) => Shape | undefined,
): ErConstraintShape {
  const er = (id: string) => {
    const shape = get(id);
    return shape?.type.startsWith("er-") ? (shape as ErShape) : undefined;
  };
  const points = constraintPoints(constraint, er);
  if (points.length < 2) return { ...constraint, points: [] };
  const box = boundsOf(points);
  return {
    ...constraint,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    points: points.flatMap((p) => [p.x - box.x, p.y - box.y]),
  };
}

function boundsOf(points: readonly Point[]): Rect {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs) - CONSTRAINT_PADDING;
  const y = Math.min(...ys) - CONSTRAINT_PADDING;
  return {
    x,
    y,
    w: Math.max(...xs) + CONSTRAINT_PADDING - x,
    h: Math.max(...ys) + CONSTRAINT_PADDING - y,
  };
}
