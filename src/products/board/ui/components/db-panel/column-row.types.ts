import type { DbColumn, DbTableElement } from "@board";

export interface ColumnRowProps {
  table: DbTableElement;
  column: DbColumn;
  index: number;
}
