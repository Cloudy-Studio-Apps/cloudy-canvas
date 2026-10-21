import type { DbTableShape } from "../document";
import type { Point, Rect } from "../geometry.types";

/** The table row a dragged relation would connect to. */
export interface DropTarget {
  table: DbTableShape;
  row: number;
}

/** Screen-space feedback drawn above the shapes. All rects are in world units. */
export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
  /** Column handles of the hovered/selected database tables. */
  handles: Point[];
  /** Column row a relation being dragged would connect to. */
  dropTarget: Rect | null;
}
