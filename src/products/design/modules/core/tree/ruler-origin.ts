import type { CanvasElement, ElementKinds, Point } from "@canvas";

import { DesignNodeKind } from "../node";
import { nearestContainer } from "./nearest-container";

/**
 * Where the rulers count from, as in Figma: the top-left corner of the container the selected
 * layers share (a selected container at the top of the page counts from itself), or `null` (the
 * page's origin) when they don't share one or it's turned.
 */
export function selectionRulerOrigin(
  selected: readonly CanvasElement[],
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): Point | null {
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
  return shared && !shared.rotation ? { x: shared.x, y: shared.y } : null;
}
