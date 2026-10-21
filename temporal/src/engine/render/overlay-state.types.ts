import type { DbTableShape, Shape } from "../document";
import type { Point, Rect } from "../geometry.types";

/** The table row a dragged relation would connect to. */
export interface DropTarget {
  table: DbTableShape;
  row: number;
}

export interface OverlayInput {
  /** Selected shapes, with connectors resolved. */
  selected: Shape[];
  hover: Shape | undefined;
  marquee: Rect | null;
  dropTarget: DropTarget | null;
  zoom: number;
}

/** Screen-space feedback drawn above the shapes. All rects and points are in world units. */
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
  /** Resize handles of a single selected shape. */
  resizeHandles: Point[];
  /** Ends of the selected connectors. */
  endpoints: Point[];
  /** Dots to drag a new connector out of the hovered/selected shape. */
  quickConnect: Point[];
}
