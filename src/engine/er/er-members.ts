import type { Shape } from "../document";

/**
 * The ids plus what goes with them: the attributes of any ER shape among them (recursively), and,
 * with `boxed`, what an aggregation box holds (its relation and participants), so dragging the box
 * moves its contents. Deleting a box (`boxed` false) leaves its contents.
 */
export function withErMembers(
  ids: Iterable<string>,
  shapes: readonly Shape[],
  boxed = true,
): Set<string> {
  const result = new Set(ids);
  if (boxed) {
    for (const shape of shapes) {
      if (shape.type !== "er-aggregate" || !result.has(shape.id)) continue;
      const relation = shapes.find((s) => s.id === shape.relationId);
      result.add(shape.relationId);
      if (relation?.type === "er-relation") {
        for (const p of relation.participants) result.add(p.entityId);
      }
    }
  }
  let grew = true;
  while (grew) {
    grew = false;
    for (const shape of shapes) {
      if (shape.type === "er-attribute" && !result.has(shape.id) && result.has(shape.ownerId)) {
        result.add(shape.id);
        grew = true;
      }
    }
  }
  return result;
}
