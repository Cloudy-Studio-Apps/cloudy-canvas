import type { CanvasElement, ElementHandle, ElementKinds } from "../elements";
import type { Point, Rect } from "../geometry.types";

export interface OverlayInput {
  kinds: ElementKinds;
  selected: CanvasElement[];
  /** The selected part of the single selected element, if any. */
  part: string | null;
  hover: CanvasElement | undefined;
  marquee: Rect | null;
  zoom: number;
}

/** Screen-space feedback drawn above the elements. All rects and points are in world units. */
export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
  /** Handles the kinds of the selected and hovered elements offer (`ElementKind.handles`). */
  handles: ElementHandle[];
  /** The box the size label measures: the selection's bounds (outlined elements only). */
  size: Rect | null;
  /** Resize handles of the selection (one element, or the box round several). */
  resizeHandles: Point[];
  /** Rects of the selected part of the single selected element (e.g. a table row, some cells). */
  part: Rect[];
}
