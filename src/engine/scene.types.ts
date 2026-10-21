import type { Point } from "./geometry.types";

/** A relation being dragged from a table's column row to `end` (world). */
export interface DraftRelation {
  tableId: string;
  row: number;
  end: Point;
}
