import { elementBounds, type CanvasElement, type ElementKinds } from "../elements";
import { unionRects } from "../geometry";
import type { ResizeMode, ResizeTarget } from "./handles.types";

/**
 * What the resize handles and rotate zones of a selection act on, or `null` when it has neither:
 * one element that resizes or turns, by its own (turned) box; or several (locked ones stay put),
 * when one of them resizes or all of them turn, by the box round the outlined ones as they show
 * (never turned). With the Scale tool (`mode` "scale"), what scales gets the handles instead of what
 * resizes (e.g. a line or a group too); with `none`, nothing does.
 */
export function resizeTarget(
  selected: readonly CanvasElement[],
  kinds: ElementKinds,
  mode: ResizeMode = "resize",
): ResizeTarget | null {
  const sizes = (el: CanvasElement) => {
    const kind = kinds.kindOf(el);
    return mode === "scale" ? kind.scalable : kind.resizable;
  };
  const [first] = selected;
  if (!first || mode === "none") return null;
  if (selected.length === 1) {
    const kind = kinds.kindOf(first);
    const turns = kind.rotatable && kind.boxed;
    const resizable = sizes(first);
    if (first.locked || !(resizable || turns)) return null;
    const rotation = kind.rotatable ? (first.rotation ?? 0) : 0;
    return { elements: [first], box: kind.bounds(first), rotation, resizable };
  }

  const elements = selected.filter((el) => !el.locked);
  const resizable = elements.some(sizes);
  if (!resizable && !elements.every((el) => kinds.kindOf(el).rotatable)) return null;
  const box = unionRects(
    elements
      // Scaling takes lines along by what they draw.
      .filter((el) => mode === "scale" || kinds.kindOf(el).boxed)
      .map((el) => elementBounds(kinds.kindOf(el), el)),
  );
  return box ? { elements, box, rotation: 0, resizable } : null;
}
