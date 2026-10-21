import type { DbColumn, DbTableShape } from "@engine";

export interface ColumnTypePickerProps {
  table: DbTableShape;
  column: DbColumn;
}

export type TypeTab = "all" | "enums" | "types";
