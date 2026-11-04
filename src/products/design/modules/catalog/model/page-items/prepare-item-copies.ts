import type { CanvasElement, CopyContext } from "@canvas";

import { isDesignNode } from "../../../core";
import { pageItemTag } from "./page-item-fields";

/**
 * Copies of master layers' copies (`prepareCopies`): copied with the page frame that holds them
 * they're left out (the frame is stamped again once it's a page; else it's the page's own design
 * without the brochure's master); copied on their own they become ordinary layers, unlocked and
 * untagged, keeping their template so their number still reads.
 */
export function prepareItemCopies(
  copies: CanvasElement[],
  { copied }: CopyContext,
): CanvasElement[] {
  const byId = new Map(copies.map((el) => [el.id, el]));
  const dropped = new Map<string, boolean>();
  const drops = (el: CanvasElement): boolean => {
    const known = dropped.get(el.id);
    if (known !== undefined) return known;
    dropped.set(el.id, false);
    const parentId = isDesignNode(el) ? el.parentId : null;
    const parent = parentId && copied.has(parentId) ? byId.get(parentId) : undefined;
    // Under a copied page frame (or a copy that's left out) it goes; else it's kept, freed.
    const drop =
      pageItemTag(el) !== null && parent !== undefined && (!pageItemTag(parent) || drops(parent));
    dropped.set(el.id, drop);
    return drop;
  };
  return copies
    .filter((el) => !drops(el))
    .map((el) =>
      pageItemTag(el) ? ({ ...el, catalogCopy: null, locked: false } as CanvasElement) : el,
    );
}
