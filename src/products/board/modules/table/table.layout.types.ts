import type { TableAxis } from "./table.types";

/** A cell's position in the grid. */
export interface TableCell {
  row: number;
  column: number;
}

/** A grid line: the one after row or column `index` (the last one is the outer edge). */
export interface TableLine {
  axis: TableAxis;
  index: number;
}
