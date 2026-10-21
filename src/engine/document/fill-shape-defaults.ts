import type { Shape } from "./shapes.types";

/** Fills fields added after a shape type first shipped, so boards saved by older versions load. */
export function fillShapeDefaults(shape: Shape): Shape {
  if (shape.type === "db-table") {
    return { ...shape, indexes: shape.indexes ?? [], noteHidden: shape.noteHidden ?? false };
  }
  return shape;
}
