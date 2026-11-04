import type { DataField } from "../source";

/** One row of the data: its values by field name, as parsed. */
export type DataRow = Record<string, unknown>;

/** Rows with the fields found in them. */
export interface DataTable {
  rows: readonly DataRow[];
  fields: DataField[];
}
