import type { DbColumn, DbTableElement } from "@board";

export interface RefPickerProps {
  table: DbTableElement;
  column: DbColumn;
}
