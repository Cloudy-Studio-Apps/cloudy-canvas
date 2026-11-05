import type { BrochureSlot } from "../../brochure";
import type { BrochureExpansion } from "./expand-brochure.types";
import { slotKey } from "./slot-key";

/**
 * The rows a copy's slot shows (`ExpandedPage.rows`), read from the brochure's expansion; a copy
 * the expansion doesn't list (its list unreadable here) falls back to its copy path.
 */
export function copyRows(expansion: BrochureExpansion): (slot: BrochureSlot) => readonly string[] {
  const rows = new Map(expansion.pages.map((page) => [page.id, page.rows]));
  return (slot) => rows.get(slotKey(slot)) ?? slot.generated?.path ?? [];
}
