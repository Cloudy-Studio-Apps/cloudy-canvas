import type { DbColumn, DbTableElement } from "../../table/db-table.types";

export interface ColumnDetailsProps {
  table: DbTableElement;
  column: DbColumn;
  index: number;
}
