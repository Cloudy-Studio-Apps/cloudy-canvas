import type { DbTableElement } from "./db-table.types";

/** A column row of a table: where a dragged relation starts or would land. */
export interface ColumnRow {
  table: DbTableElement;
  row: number;
}
