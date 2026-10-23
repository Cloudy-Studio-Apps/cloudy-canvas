import type { ErShapes } from "@board";

/** Everything that moves with the diagram; aggregations and constraints follow on their own. */
export function diagramShapeIds({ entities, relations, attributes, isas }: ErShapes): string[] {
  return [...entities, ...relations, ...attributes, ...isas].map((shape) => shape.id);
}
