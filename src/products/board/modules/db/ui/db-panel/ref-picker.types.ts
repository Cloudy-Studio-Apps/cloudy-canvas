import type { DbColumn, DbTableElement } from "../../table/db-table.types";

export interface RefPickerProps {
  table: DbTableElement;
  column: DbColumn;
}
