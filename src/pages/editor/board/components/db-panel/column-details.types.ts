import type { DbColumn, DbTableShape } from "@engine";

export interface ColumnDetailsProps {
  table: DbTableShape;
  column: DbColumn;
  index: number;
}
