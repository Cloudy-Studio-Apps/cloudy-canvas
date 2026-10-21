import type { Shape } from "../document";

/** The ids plus the attributes of any entity, relation or attribute among them, recursively. */
export function withErMembers(ids: Iterable<string>, shapes: readonly Shape[]): Set<string> {
  const result = new Set(ids);
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
