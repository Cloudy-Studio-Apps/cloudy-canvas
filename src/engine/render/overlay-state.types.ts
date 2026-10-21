import type { Rect } from "../geometry.types";

/** Screen-space feedback drawn above the shapes. All rects are in world units. */
export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
}
