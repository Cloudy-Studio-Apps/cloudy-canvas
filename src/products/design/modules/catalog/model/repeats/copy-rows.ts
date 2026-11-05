import type { BrochureSlot } from "../../brochure";
import type { BrochureExpansion } from "./expand-brochure.types";
import { slotKey } from "./slot-key";

/**
 * The rows a copy's slot shows (`ExpandedPage.rows`), read from the brochure's expansion; `null`
 * when they can't be read on this device (the expansion doesn't list the copy, or a loop around
 * it reads a list whose data isn't here), so a page is never named by a guess.
 */
export function copyRows(
  expansion: BrochureExpansion,
): (slot: BrochureSlot) => readonly string[] | null {
  const pages = new Map(expansion.pages.map((page) => [page.id, page]));
  return (slot) => {
    const page = pages.get(slotKey(slot));
    return page && !page.layers.some((layer) => layer.unreadable) ? page.rows : null;
  };
}
