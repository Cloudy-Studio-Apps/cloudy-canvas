import type { DbColumn, DbTableElement } from "@board";

export interface ColumnFlagsProps {
  table: DbTableElement;
  column: DbColumn;
}
