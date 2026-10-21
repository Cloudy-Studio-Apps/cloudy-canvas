import type { DbColumn, DbTableElement } from "@board";

export interface ColumnDetailsProps {
  table: DbTableElement;
  column: DbColumn;
  index: number;
}
