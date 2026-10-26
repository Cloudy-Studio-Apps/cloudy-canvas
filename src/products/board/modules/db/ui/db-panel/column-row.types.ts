import type { DbColumn, DbTableElement } from "../../table/db-table.types";

export interface ColumnRowProps {
  table: DbTableElement;
  column: DbColumn;
  index: number;
}
