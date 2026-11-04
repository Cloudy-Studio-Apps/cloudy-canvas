import type { DataField } from "../../source";
import type { DataRow } from "../../table";

export interface RowsTableProps {
  rows: readonly DataRow[];
  fields: readonly DataField[];
}
