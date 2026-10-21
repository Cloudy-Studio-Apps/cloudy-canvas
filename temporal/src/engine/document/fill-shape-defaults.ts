import { splitColumnType } from "./column-type";
import { canonicalTypeName } from "./type-aliases";
import { NO_ER_DIAGRAM } from "./er-diagram-fields";
import { isErShape } from "./shapes";
import type { DbColumn, Shape } from "./shapes.types";

/** Fills fields added after a shape type first shipped, so boards saved by older versions load. */
export function fillShapeDefaults(shape: Shape): Shape {
  return isErShape(shape) && shape.diagram === undefined
    ? fillTypeDefaults({ ...shape, ...NO_ER_DIAGRAM })
    : fillTypeDefaults(shape);
}

function fillTypeDefaults(shape: Shape): Shape {
  if (shape.type === "db-table") {
    return {
      ...shape,
      columns: shape.columns.map(fillColumnDefaults),
      indexes: shape.indexes ?? [],
      noteHidden: shape.noteHidden ?? false,
    };
  }
  if (shape.type === "er-attribute") {
    return { ...shape, optional: shape.optional ?? false, look: shape.look ?? "ellipse" };
  }
  if (shape.type === "er-relation") {
    return {
      ...shape,
      idMark: shape.idMark ?? false,
      participants: shape.participants.map((p) => ({ ...p, arrow: p.arrow ?? false })),
    };
  }
  return shape;
}

/**
 * Columns saved before `typeArgs` existed kept the arguments in the type (`varchar(255)`), and
 * older types may use an alias (`int`).
 */
function fillColumnDefaults(column: DbColumn): DbColumn {
  if (column.typeArgs === undefined) return { ...column, ...splitColumnType(column.type) };
  const type = canonicalTypeName(column.type);
  return type === column.type ? column : { ...column, type };
}
