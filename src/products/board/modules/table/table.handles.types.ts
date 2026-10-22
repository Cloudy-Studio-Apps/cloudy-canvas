import type { Rect } from "@canvas";

import type { TableAxis } from "./table.types";

/** A "+" strip beside the table that adds a row (below) or a column (on the right). */
export interface TableAddBar {
  axis: TableAxis;
  rect: Rect;
}

/** The grip outside a row (left) or column (top) that selects and drags it. */
export interface TableGrip {
  axis: TableAxis;
  index: number;
  rect: Rect;
}
