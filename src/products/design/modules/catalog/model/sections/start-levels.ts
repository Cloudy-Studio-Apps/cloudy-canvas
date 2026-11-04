import type { BrochureSection, BrochureSlot } from "../../brochure";
import { placeSections } from "./place-sections";
import type { StartLevels } from "./sections.types";

/**
 * The levels a new section can start at on slot `slotId`: next to the section the page is in
 * (or at the top), or inside it; on a page where sections start already, only inside the
 * deepest of them.
 */
export function startLevels(
  sections: readonly BrochureSection[],
  slots: readonly BrochureSlot[],
  slotId: string,
): StartLevels {
  const position = slots.findIndex((slot) => slot.id === slotId);
  const placed = placeSections(sections, slots);
  const here = placed.filter((item) => item.position === position);
  if (here.length > 0) {
    return { section: null, subsection: Math.max(...here.map((item) => item.depth)) + 1 };
  }
  const inner = placed.filter((item) => item.position < position).at(-1);
  return inner
    ? { section: inner.depth, subsection: inner.depth + 1 }
    : { section: 0, subsection: null };
}
