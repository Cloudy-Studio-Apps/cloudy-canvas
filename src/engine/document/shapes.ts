import type { Shape, EditableShape } from "./shapes.types";

export function isEditableShape(shape: Shape | undefined): shape is EditableShape {
  return shape?.type === "sticky" || shape?.type === "text";
}
