import type { DbColumn, DbTableElement } from "../../table/db-table.types";

export interface ColumnFlagsProps {
  table: DbTableElement;
  column: DbColumn;
}
