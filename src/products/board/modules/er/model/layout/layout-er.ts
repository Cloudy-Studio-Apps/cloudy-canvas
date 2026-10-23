import type { Size } from "@canvas";

import type { ErElement } from "../../base/er.types";
import type { ErShapes } from "../lang";
import {
  clearAggregateBoxes,
  clearAggregateBoxesForIsas,
  clearForeignDiamonds,
} from "./aggregate-boxes";
import { boxAt, overlaps } from "./box";
import { segmentHitsRect } from "./obstacles";
import { entityGrid } from "./entity-grid";
import { entityNeighbors, erShapeMap } from "./er-graph";
import { layoutMetrics } from "./layout-metrics";
import type { Centers, LayoutMetrics } from "./layout.types";
import {
  placeAggregateCenters,
  pushIsasOutOfAggregates,
  pushOutOfAggregates,
} from "./place-aggregates";
import { placeAggregateAttributes } from "./place-aggregate-attributes";
import { placeAttributes } from "./place-attributes";
import { placeIsas } from "./place-isas";
import { placeUnions } from "./place-unions";
import { placeRelations } from "./place-relations";
import { resolveOverlaps } from "./resolve-overlaps";

/** Grid steps tried around a related entity, nearest first. */
const NEAR_STEPS: readonly [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [2, 0],
  [0, 2],
];

/** A fresh layout of the whole model, as shape centers. */
export function layoutAll(shapes: ErShapes): Centers {
  const metrics = layoutMetrics(shapes);
  const centers: Centers = new Map();
  for (const [id, cell] of entityGrid(shapes)) {
    centers.set(id, { x: cell.c * metrics.pitchX, y: cell.r * metrics.pitchY });
  }
  placeAroundEntities(shapes, centers);
  const movable = new Set(
    [...shapes.relations, ...shapes.attributes, ...shapes.isas, ...shapes.unions].map((s) => s.id),
  );
  resolveOverlaps(centers, sizesOf(shapes), movable);
  return centers;
}

/**
 * With the entities placed: hierarchy triangles, then diamonds (those between entities first, so
 * aggregation boxes can be worked out before the relations that use them), then attributes.
 */
function placeAroundEntities(shapes: ErShapes, centers: Centers): void {
  placeIsas(shapes, centers);
  placeUnions(shapes, centers);
  const boxes = new Set(shapes.aggregates.map((a) => a.id));
  const usesBox = (r: ErShapes["relations"][number]) =>
    r.participants.some((p) => boxes.has(p.entityId));
  placeRelations({ ...shapes, relations: shapes.relations.filter((r) => !usesBox(r)) }, centers);
  const boxSizes = placeAggregateCenters(shapes, centers);
  placeRelations(shapes, centers);
  pushOutOfAggregates(shapes, centers, boxSizes);
  pushIsasOutOfAggregates(shapes, centers, boxSizes);
  placeAttributes(shapes, centers, boxSizes);
  clearAggregateBoxes(shapes, centers);
  clearAggregateBoxesForIsas(shapes, centers);
  clearForeignDiamonds(shapes, centers);
  placeAggregateAttributes(shapes, centers);
  placeAttributes(shapes, centers, boxSizes);
}

/**
 * Centers for the shapes in `added`, leaving everything in `fixed` where it is: new entities go
 * next to an entity they relate to, new diamonds between their entities, and new attributes fan out
 * in the directions their owner still has free.
 */
export function placeNew(shapes: ErShapes, fixed: Centers, added: ReadonlySet<string>): Centers {
  const metrics = layoutMetrics(shapes);
  const centers: Centers = new Map([...fixed].filter(([id]) => !added.has(id)));
  const byId = erShapeMap(shapes);
  const neighbors = entityNeighbors(shapes);
  for (const entity of shapes.entities) {
    if (centers.has(entity.id)) continue;
    centers.set(
      entity.id,
      nearFreeSpot(entity, neighbors.get(entity.id) ?? [], centers, byId, metrics),
    );
  }
  placeAroundEntities(shapes, centers);
  resolveOverlaps(centers, sizesOf(shapes), added);
  return centers;
}

function nearFreeSpot(
  entity: ErElement,
  related: readonly string[],
  centers: Centers,
  byId: ReadonlyMap<string, ErElement>,
  metrics: LayoutMetrics,
) {
  const footprint = { w: entity.w + metrics.ringX * 2, h: entity.h + metrics.ringY * 2 };
  const boxes = [...centers].flatMap(([id, center]) => {
    const shape = byId.get(id);
    return shape ? [{ id, rect: boxAt(center, shape) }] : [];
  });
  const taken = boxes.map((box) => box.rect);
  // Prefer a spot whose line to the related entity is clear; then any spot with room.
  for (const needClearLine of [true, false]) {
    for (const id of related) {
      const base = centers.get(id);
      if (!base) continue;
      for (const [c, r] of NEAR_STEPS) {
        const center = { x: base.x + c * metrics.pitchX, y: base.y + r * metrics.pitchY };
        const box = boxAt(center, footprint);
        if (taken.some((rect) => overlaps(rect, box))) continue;
        const blocked =
          needClearLine &&
          boxes.some((other) => other.id !== id && segmentHitsRect(base, center, other.rect));
        if (!blocked) return center;
      }
    }
  }
  // Nothing related (or no room): to the right of everything.
  if (taken.length === 0) return { x: 0, y: 0 };
  const right = Math.max(...taken.map((rect) => rect.x + rect.w));
  const top = Math.min(...taken.map((rect) => rect.y));
  return { x: right + footprint.w / 2 + metrics.ringX, y: top + footprint.h / 2 };
}

function sizesOf({ entities, relations, attributes, isas, unions }: ErShapes): Map<string, Size> {
  return new Map<string, Size>(
    [...entities, ...relations, ...attributes, ...isas, ...unions].map((s) => [
      s.id,
      { w: s.w, h: s.h },
    ]),
  );
}
