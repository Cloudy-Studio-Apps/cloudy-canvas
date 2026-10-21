import { isSection, type Shape } from "../document";
import { shapeBounds } from "../hit-test";
import { rectContainsRect } from "../geometry";

/** Shapes that belong to a section: everything fully inside it, nested sections included. */
export function sectionMembers(section: Shape, shapes: readonly Shape[]): Shape[] {
  const area = shapeBounds(section);
  return shapes.filter(
    (shape) => shape.id !== section.id && rectContainsRect(area, shapeBounds(shape)),
  );
}

/** Selected ids plus everything inside any selected section. */
export function withSectionMembers(ids: Iterable<string>, shapes: readonly Shape[]): Set<string> {
  const result = new Set(ids);
  for (const shape of shapes) {
    if (!result.has(shape.id) || !isSection(shape)) continue;
    for (const member of sectionMembers(shape, shapes)) result.add(member.id);
  }
  return result;
}
