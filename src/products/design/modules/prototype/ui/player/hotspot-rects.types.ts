import type { Rect } from "@canvas";

/** A layer of a screen that has interactions, and where it is on the screen (world units). */
export interface HotspotRect {
  id: string;
  /** Relative to the screen's top-left corner. */
  rect: Rect;
}
