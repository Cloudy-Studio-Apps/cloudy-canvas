import type { Shape } from "../document";
import { unionRects } from "../geometry";
import type { Rect } from "../geometry.types";
import { shapeBounds } from "../hit-test";
import type { OverlayState } from "./overlay-state.types";

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
