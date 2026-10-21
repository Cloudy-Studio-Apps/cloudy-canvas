import type { CanvasElement } from "@canvas";

import { isErElement } from "../base/is-er-element";

/**
 * The ids plus what goes with them: the attributes of any ER shape among them (recursively), and,
 * with `boxed`, what an aggregation box holds (its relation and participants), so dragging the box
 * moves its contents. Deleting a box (`boxed` false) leaves its contents.
 */
export function withErMembers(
  ids: Iterable<string>,
  shapes: readonly CanvasElement[],
  boxed = true,
): Set<string> {
  const result = new Set(ids);
  const er = shapes.filter(isErElement);
  if (boxed) {
    for (const shape of er) {
      if (shape.type !== "er-aggregate" || !result.has(shape.id)) continue;
      const relation = er.find((s) => s.id === shape.relationId);
      result.add(shape.relationId);
      if (relation?.type === "er-relation") {
        for (const p of relation.participants) result.add(p.entityId);
      }
    }
  }
  let grew = true;
  while (grew) {
    grew = false;
    for (const shape of er) {
      if (shape.type === "er-attribute" && !result.has(shape.id) && result.has(shape.ownerId)) {
        result.add(shape.id);
        grew = true;
      }
    }
  }
  return result;
}
