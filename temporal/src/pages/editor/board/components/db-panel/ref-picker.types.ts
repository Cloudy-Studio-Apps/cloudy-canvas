import type { DbColumn, DbTableShape } from "@engine";

export interface RefPickerProps {
  table: DbTableShape;
  column: DbColumn;
}
