import type { ErRelationElement } from "./relation.types";

/** "I" for dependency by identification, "E" by existence ("I E" for both, which Check reports). */
export function dependencyLetter(shape: ErRelationElement): string {
  if (shape.idMark && shape.existenceMark) return "I E";
  return shape.idMark ? "I" : shape.existenceMark ? "E" : "";
}
