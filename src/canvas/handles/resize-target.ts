import type { CanvasElement, ElementKinds } from "../elements";
import { unionRects } from "../geometry";
import type { ResizeTarget } from "./handles.types";

/**
 * What the resize handles of a selection resize, or `null` when it has none: a single resizable
 * element, or several elements (locked ones stay put) when at least one of them is resizable, by
 * the box around the outlined ones.
 */
export function resizeTarget(
  selected: readonly CanvasElement[],
  kinds: ElementKinds,
): ResizeTarget | null {
  const [first] = selected;
  if (!first) return null;
  if (selected.length === 1) {
    const kind = kinds.kindOf(first);
    return !first.locked && kind.resizable ? { elements: [first], box: kind.bounds(first) } : null;
  }

  const elements = selected.filter((el) => !el.locked);
  if (!elements.some((el) => kinds.kindOf(el).resizable)) return null;
  const box = unionRects(
    elements.filter((el) => kinds.kindOf(el).boxed).map((el) => kinds.kindOf(el).bounds(el)),
  );
  return box ? { elements, box } : null;
}
