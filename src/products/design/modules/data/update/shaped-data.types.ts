import type { DataRow, DataShape } from "../table";

/** A source's rows as its rows path and shape step read them. */
export interface ShapedData {
  rows: DataRow[];
  /** The rows as read, before a shape step that changes something; left out without one. */
  raw?: DataRow[];
}

/** How a source reads its rows: where they are and its shape step. */
export interface SourceRead {
  rowsPath: string | null;
  shape: DataShape | null;
}
