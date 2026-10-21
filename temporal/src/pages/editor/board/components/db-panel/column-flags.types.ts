import type { DbColumn, DbTableShape } from "@engine";

export interface ColumnFlagsProps {
  table: DbTableShape;
  column: DbColumn;
}
