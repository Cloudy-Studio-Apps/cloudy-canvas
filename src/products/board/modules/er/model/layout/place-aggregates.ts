import type { Rect, Size } from "@canvas";

import type { ErShapes } from "../lang";
import { boxAt, overlaps } from "./box";
import { aggregateEntities, erShapeMap } from "./er-graph";
import type { Centers } from "./layout.types";

/** Room the box leaves round what it holds (its attributes included, roughly). */
const BOX_MARGIN = 56;
const PUSH_STEP = 12;
const MAX_PUSHES = 60;

/**
 * Gives each aggregation whose contents are placed a center and an estimated box, so relations it
 * takes part in can be placed against it. Returns the estimated box sizes.
 */
export function placeAggregateCenters(shapes: ErShapes, centers: Centers): Map<string, Size> {
  const sizes = new Map<string, Size>();
  for (const aggregate of shapes.aggregates) {
    const box = aggregateBox(aggregate.id, shapes, centers);
    if (!box) continue;
    centers.set(aggregate.id, { x: box.x + box.w / 2, y: box.y + box.h / 2 });
    sizes.set(aggregate.id, { w: box.w, h: box.h });
  }
  return sizes;
}

/** Diamonds of relations an aggregation takes part in are moved out of its box, away from it. */
export function pushOutOfAggregates(
  shapes: ErShapes,
  centers: Centers,
  sizes: ReadonlyMap<string, Size>,
): void {
  for (const relation of shapes.relations) {
    const center = centers.get(relation.id);
    if (!center) continue;
    for (const p of relation.participants) {
      const size = sizes.get(p.entityId);
      const boxCenter = centers.get(p.entityId);
      if (!size || !boxCenter) continue;
      const box = boxAt(boxCenter, size);
      let dx = center.x - boxCenter.x;
      let dy = center.y - boxCenter.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) {
        dx = 0;
        dy = 1;
      } else {
        dx /= len;
        dy /= len;
      }
      let next = center;
      for (let i = 0; i < MAX_PUSHES && overlaps(box, boxAt(next, relation, PUSH_STEP)); i++) {
        next = { x: next.x + dx * PUSH_STEP, y: next.y + dy * PUSH_STEP };
      }
      centers.set(relation.id, next);
    }
  }
}

/**
 * Hierarchy triangles that landed in an aggregation box they aren't part of move further from
 * their parent, out of the box.
 */
export function pushIsasOutOfAggregates(
  shapes: ErShapes,
  centers: Centers,
  sizes: ReadonlyMap<string, Size>,
): void {
  for (const isa of shapes.isas) {
    const center = centers.get(isa.id);
    const parent = centers.get(isa.parentId);
    if (!center || !parent) continue;
    const len = Math.hypot(center.x - parent.x, center.y - parent.y) || 1;
    const dx = (center.x - parent.x) / len;
    const dy = (center.y - parent.y) / len;
    let next = center;
    for (const [id, size] of sizes) {
      const boxCenter = centers.get(id);
      if (!boxCenter) continue;
      const box = boxAt(boxCenter, size);
      for (let i = 0; i < MAX_PUSHES && overlaps(box, boxAt(next, isa, PUSH_STEP)); i++) {
        next = { x: next.x + dx * PUSH_STEP, y: next.y + dy * PUSH_STEP };
      }
    }
    centers.set(isa.id, next);
  }
}

function aggregateBox(id: string, shapes: ErShapes, centers: Centers): Rect | null {
  const aggregate = shapes.aggregates.find((a) => a.id === id);
  if (!aggregate) return null;
  const byId = erShapeMap(shapes);
  const members = [aggregate.relationId, ...(aggregateEntities(shapes).get(id) ?? [])];
  const rects = members.flatMap((member) => {
    const center = centers.get(member);
    const shape = byId.get(member);
    return center && shape ? [boxAt(center, shape)] : [];
  });
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x)) - BOX_MARGIN;
  const y = Math.min(...rects.map((r) => r.y)) - BOX_MARGIN;
  const right = Math.max(...rects.map((r) => r.x + r.w)) + BOX_MARGIN;
  const bottom = Math.max(...rects.map((r) => r.y + r.h)) + BOX_MARGIN;
  return { x, y, w: right - x, h: bottom - y };
}
