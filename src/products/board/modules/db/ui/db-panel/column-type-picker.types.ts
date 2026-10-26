import type { DbColumn, DbTableElement } from "../../table/db-table.types";

export interface ColumnTypePickerProps {
  table: DbTableElement;
  column: DbColumn;
}

export type TypeTab = "all" | "enums" | "types";
