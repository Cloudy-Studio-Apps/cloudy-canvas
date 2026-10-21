import type { DbTableShape, EditableShape, Shape } from "./shapes.types";

export function isEditableShape(shape: Shape | undefined): shape is EditableShape {
  return shape?.type === "sticky" || shape?.type === "text";
}

export function isDbTable(shape: Shape | undefined): shape is DbTableShape {
  return shape?.type === "db-table";
}
