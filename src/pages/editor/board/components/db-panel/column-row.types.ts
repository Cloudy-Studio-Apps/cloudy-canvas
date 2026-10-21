import type { DbColumn, DbTableShape } from "@engine";

export interface ColumnRowProps {
  table: DbTableShape;
  column: DbColumn;
  index: number;
}
