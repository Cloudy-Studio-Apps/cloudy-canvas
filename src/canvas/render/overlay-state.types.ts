import type { CanvasElement, ElementKinds } from "../elements";
import type { Point, Rect } from "../geometry.types";

export interface OverlayInput {
  kinds: ElementKinds;
  selected: CanvasElement[];
  hover: CanvasElement | undefined;
  marquee: Rect | null;
}

/** Screen-space feedback drawn above the elements. All rects and points are in world units. */
export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
  /** Resize handles of a single selected element. */
  resizeHandles: Point[];
}
