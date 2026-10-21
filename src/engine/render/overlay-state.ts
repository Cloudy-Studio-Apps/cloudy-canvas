import type { Shape } from "../document";
import { unionRects, type Rect } from "../geometry";
import { shapeBounds } from "../hit-test";

/** Screen-space feedback drawn above the shapes. All rects are in world units. */
export interface OverlayState {
  selection: Rect[];
  /** Bounding box around a multi-selection. */
  selectionBounds: Rect | null;
  hover: Rect | null;
  marquee: Rect | null;
}

export function buildOverlayState(
  selected: Shape[],
  hover: Shape | undefined,
  marquee: Rect | null,
): OverlayState {
  const selection = selected.map(shapeBounds);
  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover ? shapeBounds(hover) : null,
    marquee,
  };
}
