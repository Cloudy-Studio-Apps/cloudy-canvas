import { elementBounds, type CanvasElement, type ElementKinds } from "../elements";
import { unionRects } from "../geometry";
import { RESIZE_HANDLES, resizeHandlePoint, resizeTarget } from "../handles";
import type { Outline, OverlayInput, OverlayState, SizeLabel } from "./overlay-state.types";

export function buildOverlayState({
  kinds,
  selected,
  part,
  hover,
  marquee,
  zoom,
}: OverlayInput): OverlayState {
  const outlined = selected.filter((el) => kinds.kindOf(el).boxed);
  const selection = outlined.map((el) => outlineOf(el, kinds));
  const single = selected.length === 1 ? selected[0] : undefined;
  const target = resizeTarget(selected, kinds);
  const resizeHandles = target?.resizable
    ? RESIZE_HANDLES.map((handle) => resizeHandlePoint(target.box, handle, target.rotation))
    : [];
  const selectionBounds =
    outlined.length > 1
      ? unionRects(outlined.map((el) => elementBounds(kinds.kindOf(el), el)))
      : null;

  const withHandles = hover && !selected.includes(hover) ? [...selected, hover] : selected;
  const handles = withHandles
    .filter((el) => !el.locked)
    .flatMap((el) => kinds.kindOf(el).handles(el, zoom));

  return {
    selection,
    selectionBounds,
    size: sizeOf(outlined, selectionBounds, kinds),
    hover: hover && kinds.kindOf(hover).boxed ? outlineOf(hover, kinds) : null,
    marquee,
    handles,
    resizeHandles,
    part: single && part ? kinds.kindOf(single).partBounds(single, part) : [],
  };
}

/** An element's outline: its own bounds, turned when it is. */
function outlineOf(el: CanvasElement, kinds: ElementKinds): Outline {
  const kind = kinds.kindOf(el);
  const rotation = kind.rotatable ? (el.rotation ?? 0) : 0;
  return { rect: kind.bounds(el), rotation };
}

function sizeOf(
  outlined: readonly CanvasElement[],
  bounds: OverlayState["selectionBounds"],
  kinds: ElementKinds,
): SizeLabel | null {
  if (bounds) return { under: bounds, w: bounds.w, h: bounds.h };
  const [el] = outlined;
  if (!el) return null;
  const kind = kinds.kindOf(el);
  const { w, h } = kind.bounds(el);
  return { under: elementBounds(kind, el), w, h };
}
