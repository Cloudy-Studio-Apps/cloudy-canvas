import { createElementBase, type Point } from "@canvas";
import { createId } from "@shared/core";

import { DB_HEADER_COLORS } from "../../../palette";
import { tableSize } from "./db-table.layout";
import type { DbColumn, DbTableElement } from "./db-table.types";

export function createDbColumn(
  name: string,
  type: string,
  patch: Partial<Omit<DbColumn, "id">> = {},
): DbColumn {
  return {
    id: createId(),
    name,
    type,
    typeArgs: "",
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
export function createDbTable(center: Point, name: string, index: string): DbTableElement {
  const columns = [createDbColumn("id", "integer", { pk: true, increment: true })];
  const size = tableSize(name, columns);
  const rect = {
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
  };
  return {
    ...createElementBase("db-table", rect, index),
    name,
    headerColor: DB_HEADER_COLORS[0].value,
    note: "",
    noteHidden: false,
    columns,
    indexes: [],
  };
}
