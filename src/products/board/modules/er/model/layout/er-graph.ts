import type { ErElement } from "../../base/er.types";
import type { ErShapes } from "../lang";

/**
 * Entity id → the entities it's drawn next to (itself excluded): those it shares a relation or a
 * hierarchy with. An aggregation taking part in a relation stands for the entities it holds.
 */
export function entityNeighbors(shapes: ErShapes): Map<string, string[]> {
  const { entities, relations, isas } = shapes;
  const result = new Map(entities.map((e) => [e.id, [] as string[]]));
  const link = (ids: readonly string[]) => {
    for (const a of ids) {
      for (const b of ids) {
        const list = result.get(a);
        if (a !== b && list && !list.includes(b) && result.has(b)) list.push(b);
      }
    }
  };
  const inside = aggregateEntities(shapes);
  for (const relation of relations) {
    link([
      ...new Set(relation.participants.flatMap((p) => inside.get(p.entityId) ?? [p.entityId])),
    ]);
  }
  for (const isa of isas) {
    for (const child of isa.children) link([isa.parentId, child.entityId]);
  }
  return result;
}

/** Aggregation id → the entities taking part in its relation. */
export function aggregateEntities({ aggregates, relations }: ErShapes): Map<string, string[]> {
  return new Map(
    aggregates.map((aggregate) => {
      const relation = relations.find((r) => r.id === aggregate.relationId);
      return [aggregate.id, relation ? relation.participants.map((p) => p.entityId) : []];
    }),
  );
}

/** Ids of the shapes a shape has lines to, not counting its own attributes. */
export function linkedIds(shape: ErElement, { relations, isas }: ErShapes): string[] {
  if (shape.type === "er-attribute") return [shape.ownerId];
  if (shape.type === "er-relation") return [...new Set(shape.participants.map((p) => p.entityId))];
  if (shape.type === "er-isa") return [shape.parentId, ...shape.children.map((c) => c.entityId)];
  if (shape.type !== "er-entity") return [];
  return [
    ...relations
      .filter((relation) => relation.participants.some((p) => p.entityId === shape.id))
      .map((relation) => relation.id),
    ...isas
      .filter(
        (isa) => isa.parentId === shape.id || isa.children.some((c) => c.entityId === shape.id),
      )
      .map((isa) => isa.id),
  ];
}

/** Every ER shape by id. */
export function erShapeMap(shapes: ErShapes): Map<string, ErElement> {
  const { entities, relations, attributes, isas, aggregates, constraints } = shapes;
  return new Map<string, ErElement>(
    [...entities, ...relations, ...attributes, ...isas, ...aggregates, ...constraints].map(
      (shape) => [shape.id, shape],
    ),
  );
}
