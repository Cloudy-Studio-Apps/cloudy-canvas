import { unionRects } from "../geometry";
import { RESIZE_HANDLES, resizeHandlePoint } from "../handles";
import type { OverlayInput, OverlayState } from "./overlay-state.types";

export function buildOverlayState({ kinds, selected, hover, marquee }: OverlayInput): OverlayState {
  const selection = selected.map((el) => kinds.kindOf(el).bounds(el));
  const single = selected.length === 1 ? selected[0] : undefined;
  const resizeHandles =
    single && kinds.kindOf(single).resizable
      ? RESIZE_HANDLES.map((handle) =>
          resizeHandlePoint(kinds.kindOf(single).bounds(single), handle),
        )
      : [];

  const withHandles = hover && !selected.includes(hover) ? [...selected, hover] : selected;
  const handles = withHandles.flatMap((el) => kinds.kindOf(el).handles(el));

  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover ? kinds.kindOf(hover).bounds(hover) : null,
    marquee,
    handles,
    resizeHandles,
  };
}
