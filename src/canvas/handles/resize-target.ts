import { elementBounds, type CanvasElement, type ElementKinds } from "../elements";
import { unionRects } from "../geometry";
import type { ResizeTarget } from "./handles.types";

/**
 * What the resize handles and rotate zones of a selection act on, or `null` when it has neither:
 * one element that resizes or turns, by its own (turned) box; or several (locked ones stay put),
 * when one of them resizes or all of them turn, by the box round the outlined ones as they show
 * (never turned).
 */
export function resizeTarget(
  selected: readonly CanvasElement[],
  kinds: ElementKinds,
): ResizeTarget | null {
  const [first] = selected;
  if (!first) return null;
  if (selected.length === 1) {
    const kind = kinds.kindOf(first);
    const turns = kind.rotatable && kind.boxed;
    if (first.locked || !(kind.resizable || turns)) return null;
    const rotation = kind.rotatable ? (first.rotation ?? 0) : 0;
    return { elements: [first], box: kind.bounds(first), rotation, resizable: kind.resizable };
  }

  const elements = selected.filter((el) => !el.locked);
  const resizable = elements.some((el) => kinds.kindOf(el).resizable);
  if (!resizable && !elements.every((el) => kinds.kindOf(el).rotatable)) return null;
  const box = unionRects(
    elements
      .filter((el) => kinds.kindOf(el).boxed)
      .map((el) => elementBounds(kinds.kindOf(el), el)),
  );
  return box ? { elements, box, rotation: 0, resizable } : null;
}
