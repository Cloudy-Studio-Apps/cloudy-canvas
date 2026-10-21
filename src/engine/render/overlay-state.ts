import { kindOf } from "../elements";
import { unionRects } from "../geometry";
import { RESIZE_HANDLES, resizeHandlePoint } from "../handles";
import type { OverlayInput, OverlayState } from "./overlay-state.types";

export function buildOverlayState({ selected, hover, marquee }: OverlayInput): OverlayState {
  const selection = selected.map((el) => kindOf(el).bounds(el));
  const single = selected.length === 1 ? selected[0] : undefined;
  const resizeHandles =
    single && kindOf(single).resizable
      ? RESIZE_HANDLES.map((handle) => resizeHandlePoint(kindOf(single).bounds(single), handle))
      : [];

  return {
    selection,
    selectionBounds: selection.length > 1 ? unionRects(selection) : null,
    hover: hover ? kindOf(hover).bounds(hover) : null,
    marquee,
    resizeHandles,
  };
}
