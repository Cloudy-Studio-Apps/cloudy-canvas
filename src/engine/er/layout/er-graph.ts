import type { ErShape } from "../../document";
import type { ErShapes } from "../lang";

/** Entity id → the entities it shares a relation with (itself excluded), in text order. */
export function entityNeighbors({ entities, relations }: ErShapes): Map<string, string[]> {
  const result = new Map(entities.map((e) => [e.id, [] as string[]]));
  for (const relation of relations) {
    const ids = [...new Set(relation.participants.map((p) => p.entityId))];
    for (const a of ids) {
      for (const b of ids) {
        const list = result.get(a);
        if (a !== b && list && !list.includes(b) && result.has(b)) list.push(b);
      }
    }
  }
  return result;
}

/** Ids of the shapes a shape has lines to, not counting its own attributes. */
export function linkedIds(shape: ErShape, { relations }: ErShapes): string[] {
  if (shape.type === "er-attribute") return [shape.ownerId];
  if (shape.type === "er-relation") return [...new Set(shape.participants.map((p) => p.entityId))];
  return relations
    .filter((relation) => relation.participants.some((p) => p.entityId === shape.id))
    .map((relation) => relation.id);
}

/** Every ER shape by id. */
export function erShapeMap({ entities, relations, attributes }: ErShapes): Map<string, ErShape> {
  return new Map<string, ErShape>(
    [...entities, ...relations, ...attributes].map((shape) => [shape.id, shape]),
  );
}
