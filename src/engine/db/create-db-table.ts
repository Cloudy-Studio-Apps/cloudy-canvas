import { createId } from "@core";

import {
  DB_ENUM_COLOR,
  DB_HEADER_COLORS,
  type DbColumn,
  type DbEnumShape,
  type DbTableShape,
} from "../document";
import type { Point } from "../geometry.types";
import { enumSize, tableSize } from "./table-layout";

export function createDbColumn(
  name: string,
  type: string,
  patch: Partial<Omit<DbColumn, "id">> = {},
): DbColumn {
  return {
    id: createId(),
    name,
    type,
    pk: false,
    increment: false,
    notNull: false,
    unique: false,
    default: null,
    note: "",
    ref: null,
    ...patch,
  };
}

/** A new table with an auto-increment `id` primary key, centered on `center`. */
export function createDbTable(center: Point, name: string, index: string): DbTableShape {
  const columns = [createDbColumn("id", "integer", { pk: true, increment: true })];
  const size = tableSize(name, columns);
  return {
    id: createId(),
    type: "db-table",
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    name,
    headerColor: DB_HEADER_COLORS[0].value,
    note: "",
    noteHidden: false,
    columns,
    indexes: [],
  };
}

/** A new enum with two example values, centered on `center`. */
export function createDbEnum(center: Point, name: string, index: string): DbEnumShape {
  const values = ["active", "inactive"].map((value) => ({ id: createId(), name: value, note: "" }));
  const size = enumSize(name, values);
  return {
    id: createId(),
    type: "db-enum",
    index,
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
    name,
    headerColor: DB_ENUM_COLOR,
    values,
  };
}
