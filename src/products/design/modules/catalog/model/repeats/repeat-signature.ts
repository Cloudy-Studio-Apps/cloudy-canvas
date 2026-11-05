import type { BrochureElement } from "../../brochure";
import { templateSlots } from "./repeat-tree";

/**
 * What the loops around a brochure's pages are read from, as one string: its sections, its
 * template pages (order, repeats, printed frames) and its language. Its copies' slots aren't in
 * it, so the sync's own writes never change it.
 */
export function repeatSignature(
  record: Pick<BrochureElement, "slots" | "sections" | "settings">,
): string {
  return JSON.stringify([
    record.sections,
    templateSlots(record).map((slot) => [slot.id, slot.chosen, slot.repeat ?? null]),
    record.settings.language,
  ]);
}
