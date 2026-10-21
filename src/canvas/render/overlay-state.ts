import { unionRects } from "../geometry";
import { RESIZE_HANDLES, resizeHandlePoint } from "../handles";
import type { OverlayInput, OverlayState } from "./overlay-state.types";

export function buildOverlayState({
  kinds,
  selected,
  part,
  hover,
  marquee,
  zoom,
}: OverlayInput): OverlayState {
  const selection = selected
    .filter((el) => kinds.kindOf(el).boxed)
    .map((el) => kinds.kindOf(el).bounds(el));
  const single = selected.length === 1 ? selected[0] : undefined;
  const resizeHandles =
    single && kinds.kindOf(single).resizable
      ? RESIZE_HANDLES.map((handle) =>
          resizeHandlePoint(kinds.kindOf(single).bounds(single), handle),
        )
      : [];

  const withHandles = hover && !selected.includes(hover) ? [...selected, hover] : selected;
  const handles = withHandles.flatMap((el) => kinds.kindOf(el).handles(el, zoom));

  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover && kinds.kindOf(hover).boxed ? kinds.kindOf(hover).bounds(hover) : null,
    marquee,
    handles,
    resizeHandles,
    part: single && part ? kinds.kindOf(single).partBounds(single, part) : [],
  };
}
