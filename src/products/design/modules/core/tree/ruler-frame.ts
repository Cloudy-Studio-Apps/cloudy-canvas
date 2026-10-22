import type { CanvasElement, ElementKinds } from "@canvas";

import { DesignNodeKind } from "../node";
import { nearestContainer } from "./nearest-container";

/**
 * The frame the rulers measure, as in Figma: the container the selected layers share (a selected
 * container at the top of the page measures itself), or `null` (the whole page) when they don't
 * share one or it's turned. Guides dragged out of the rulers meanwhile belong to it.
 */
export function selectionRulerFrame(
  selected: readonly CanvasElement[],
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): CanvasElement | null {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const get = (id: string) => byId.get(id);
  let shared: CanvasElement | null | undefined;
  for (const el of selected) {
    const kind = kinds.kindOf(el);
    const own = kind instanceof DesignNodeKind && kind.container && selected.length === 1;
    const container = nearestContainer(el, get, kinds) ?? (own ? el : null);
    if (shared !== undefined && container?.id !== shared?.id) return null;
    shared = container;
  }
  return shared && !shared.rotation ? shared : null;
}
