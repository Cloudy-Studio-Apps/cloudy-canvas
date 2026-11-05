import type { BrochureElement } from "../../brochure";

/** Whether a brochure repeats a section or a page. */
export function hasRepeats(record: Pick<BrochureElement, "slots" | "sections">): boolean {
  return (
    record.sections.some((section) => section.repeat) || record.slots.some((slot) => slot.repeat)
  );
}
