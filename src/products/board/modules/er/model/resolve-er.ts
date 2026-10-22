import { rectOf, unionRects, type CanvasElement, type Point, type Rect } from "@canvas";

import { ER_DEFAULTS } from "../base/er.defaults";
import type { ErAggregateElement } from "../aggregate/aggregate.types";
import type { ErConstraintElement } from "../constraint/constraint.types";
import type { ErElement } from "../base/er.types";
import { isErElement } from "../base/is-er-element";
import { constraintPoints } from "./constraint-points";

/** Space between an aggregation's box and what it holds; the top also fits its name. */
const AGGREGATE_PADDING = 18;
const CONSTRAINT_PADDING = 4;

/**
 * Replaces aggregations and constraints with copies whose geometry follows the shapes they're
 * about: an aggregation's box wraps its relation, the relation's participants and their
 * attributes; a constraint's `points` run between its relations. Other shapes are returned as is.
 */
export function resolveErElements(shapes: readonly CanvasElement[]): CanvasElement[] {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  const ownerOf = new Map<string, string[]>();
  const er = shapes.filter(isErElement);
  for (const shape of er) {
    if (shape.type !== "er-attribute") continue;
    const list = ownerOf.get(shape.ownerId) ?? [];
    list.push(shape.id);
    ownerOf.set(shape.ownerId, list);
  }
  const resolved = new Map<string, CanvasElement>();
  // Two passes, so an aggregation can hold a relation that takes part with another aggregation.
  for (let pass = 0; pass < 2; pass++) {
    for (const shape of er) {
      if (shape.type !== "er-aggregate") continue;
      const next = resolveAggregate(shape, (id) => resolved.get(id) ?? byId.get(id), ownerOf);
      resolved.set(shape.id, next);
    }
  }
  const lookup = (id: string) => resolved.get(id) ?? byId.get(id);
  for (const shape of er) {
    if (shape.type === "er-constraint") resolved.set(shape.id, resolveConstraint(shape, lookup));
  }
  return shapes.map((shape) => resolved.get(shape.id) ?? shape);
}

function resolveAggregate(
  aggregate: ErAggregateElement,
  get: (id: string) => CanvasElement | undefined,
  ownerOf: ReadonlyMap<string, string[]>,
): ErAggregateElement {
  const relation = get(aggregate.relationId);
  if (!isErElement(relation) || relation.type !== "er-relation") return aggregate;
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
    return shape && shape.id !== aggregate.id ? [rectOf(shape)] : [];
  });
  const bounds = unionRects(rects);
  if (!bounds) return aggregate;
  return {
    ...aggregate,
    x: bounds.x - AGGREGATE_PADDING,
    y: bounds.y - AGGREGATE_PADDING - ER_DEFAULTS.aggregateTitleHeight,
    w: bounds.w + AGGREGATE_PADDING * 2,
    h: bounds.h + AGGREGATE_PADDING * 2 + ER_DEFAULTS.aggregateTitleHeight,
  };
}

function resolveConstraint(
  constraint: ErConstraintElement,
  get: (id: string) => CanvasElement | undefined,
): ErConstraintElement {
  const er = (id: string) => {
    const shape = get(id);
    return shape?.type.startsWith("er-") ? (shape as ErElement) : undefined;
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
