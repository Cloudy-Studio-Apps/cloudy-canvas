import type { DataSourceElement } from "../../source";
import type { DataRow } from "../../table";

export interface FieldListProps {
  source: DataSourceElement;
  rows: readonly DataRow[];
}
