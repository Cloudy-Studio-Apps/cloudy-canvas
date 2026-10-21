import type { ErAttributeShape, ErShape } from "../../document";
import type { Point } from "../../geometry.types";
import type { ErShapes } from "../lang";
import { angleTo, boxAt } from "./box";
import { erShapeMap, linkedIds } from "./er-graph";
import { fanOut } from "./fan-out";
import type { Centers, Obstacles } from "./layout.types";

/**
 * Places the attributes that aren't in `centers` yet, fanned around their owners: entities and
 * relations first, then the parts of composite attributes around their (by then placed) parent.
 */
export function placeAttributes(shapes: ErShapes, centers: Centers): void {
  const byId = erShapeMap(shapes);
  const children = new Map<string, ErAttributeShape[]>();
  for (const attribute of [...shapes.attributes].sort((a, b) => a.order - b.order)) {
    const list = children.get(attribute.ownerId) ?? [];
    list.push(attribute);
    children.set(attribute.ownerId, list);
  }
  const obstacles: Obstacles = { rects: [], segments: [] };
  for (const [id, center] of centers) {
    const shape = byId.get(id);
    if (!shape) continue;
    obstacles.rects.push(boxAt(center, shape));
    // Lines from relations to their entities, and from attributes to their owners.
    if (shape.type === "er-entity") continue;
    for (const other of linkedIds(shape, shapes)) {
      const to = centers.get(other);
      if (to) obstacles.segments.push([center, to]);
    }
  }

  const queue: ErShape[] = [...shapes.entities, ...shapes.relations];
  while (queue.length) {
    const owner = queue.shift()!;
    const center = centers.get(owner.id);
    const own = children.get(owner.id) ?? [];
    if (!center || own.length === 0) continue;
    const pending = own.filter((a) => !centers.has(a.id));
    if (pending.length) {
      // Lines to what the owner links to, and to attributes already placed, stay clear.
      const blocked = [
        ...linkedIds(owner, shapes),
        ...own.filter((a) => centers.has(a.id)).map((a) => a.id),
      ]
        .map((id) => centers.get(id))
        .filter((p): p is Point => p !== undefined)
        .map((p) => angleTo(center, p));
      const placed = fanOut({ ...center, w: owner.w, h: owner.h }, pending, blocked, obstacles);
      for (const [id, point] of placed) centers.set(id, point);
    }
    queue.push(...own);
  }
}
