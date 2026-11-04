import type { DataSourceElement } from "../../source";
import type { DataRow } from "../../table";

export interface FieldTreeViewProps {
  source: DataSourceElement;
  rows: readonly DataRow[];
}
