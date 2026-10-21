import type { DbColumn, DbTableElement } from "@board";

export interface ColumnTypePickerProps {
  table: DbTableElement;
  column: DbColumn;
}

export type TypeTab = "all" | "enums" | "types";
