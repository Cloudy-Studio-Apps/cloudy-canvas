import type { ErElement } from "../base/er.types";

/**
 * Groups ER shapes into connected diagrams: shapes are linked through attribute owners, relation
 * participants, hierarchies, aggregations and constraints. Each group lists shape ids.
 */
export function erComponents(shapes: readonly ErElement[]): string[][] {
  const parent = new Map(shapes.map((shape) => [shape.id, shape.id]));
  const root = (id: string): string => {
    let at = id;
    while (parent.get(at) !== at) at = parent.get(at) ?? at;
    parent.set(id, at);
    return at;
  };
  const join = (a: string, b: string) => {
    if (!parent.has(a) || !parent.has(b)) return;
    parent.set(root(a), root(b));
  };
  for (const shape of shapes) {
    for (const other of linkedIds(shape)) join(shape.id, other);
  }
  const groups = new Map<string, string[]>();
  for (const shape of shapes) {
    const key = root(shape.id);
    const group = groups.get(key);
    if (group) group.push(shape.id);
    else groups.set(key, [shape.id]);
  }
  return [...groups.values()];
}

function linkedIds(shape: ErElement): string[] {
  switch (shape.type) {
    case "er-attribute":
      return [shape.ownerId];
    case "er-relation":
      return shape.participants.map((p) => p.entityId);
    case "er-isa":
      return [shape.parentId, ...shape.children.map((c) => c.entityId)];
    case "er-union":
      return [shape.categoryId, ...shape.superclassIds];
    case "er-aggregate":
      return [shape.relationId];
    case "er-constraint":
      return [shape.fromId, shape.toId, shape.entityId].filter(Boolean);
    default:
      return [];
  }
}
