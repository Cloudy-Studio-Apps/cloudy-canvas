import type { Point } from "@canvas";

import type { ErShapes } from "../lang";
import { attributeTrees, exactBox } from "./aggregate-boxes";
import { boxAt, overlaps } from "./box";
import { erShapeMap } from "./er-graph";
import { RING_GAP } from "./layout-metrics";
import type { Centers } from "./layout.types";

const STEP = 14;
const CLEARANCE = 6;

/**
 * Places an aggregation's own attributes once its box is known: just outside the box, along its
 * right side first, then its bottom, left and top, at the first spot clear of every placed shape.
 */
export function placeAggregateAttributes(shapes: ErShapes, centers: Centers): void {
  const byId = erShapeMap(shapes);
  const owned = attributeTrees(shapes);
  const taken = [...centers].flatMap(([id, at]) => {
    const shape = byId.get(id);
    return shape && shape.type !== "er-aggregate" ? [boxAt(at, shape, CLEARANCE)] : [];
  });
  for (const aggregate of shapes.aggregates) {
    const pending = shapes.attributes.filter(
      (a) => a.ownerId === aggregate.id && !centers.has(a.id),
    );
    const box = pending.length ? exactBox(aggregate.id, shapes, centers, owned) : null;
    if (!box) continue;
    for (const attribute of pending) {
      const spots = edgeSpots(box, attribute);
      const at =
        spots.find((p) => !taken.some((r) => overlaps(r, boxAt(p, attribute)))) ?? spots[0]!;
      centers.set(attribute.id, at);
      taken.push(boxAt(at, attribute, CLEARANCE));
    }
  }
}

/** Centers just outside the box: down its right side, along its bottom, up its left, its top. */
function edgeSpots(
  box: { x: number; y: number; w: number; h: number },
  item: { w: number; h: number },
): Point[] {
  const out = RING_GAP / 2;
  const right = box.x + box.w + out + item.w / 2;
  const left = box.x - out - item.w / 2;
  const bottom = box.y + box.h + out + item.h / 2;
  const top = box.y - out - item.h / 2;
  const spots: Point[] = [];
  for (let y = box.y + item.h; y <= box.y + box.h - item.h / 2; y += STEP)
    spots.push({ x: right, y });
  for (let x = box.x + box.w - item.w / 2; x >= box.x + item.w / 2; x -= STEP)
    spots.push({ x, y: bottom });
  for (let y = box.y + box.h - item.h / 2; y >= box.y + item.h; y -= STEP)
    spots.push({ x: left, y });
  for (let x = box.x + item.w / 2; x <= box.x + box.w - item.w / 2; x += STEP)
    spots.push({ x, y: top });
  return spots.length ? spots : [{ x: right, y: box.y + box.h / 2 }];
}
