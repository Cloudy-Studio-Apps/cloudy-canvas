import type { BrochureElement } from "../../brochure";
import { slotKey } from "./slot-key";
import type { ExpandedPage, ExpandedSection } from "./expand-brochure.types";

/**
 * Puts the pages taken out of a repeat (`BrochureSlot.detached`) into an expansion, in place: each
 * right after the page of the slot before it in the record (the first that's in the expansion),
 * as a plain page outside every loop (no path, no layers), so the run goes on around it. It's in
 * the sections around that page, but at the end of a pass of the repeating section it came from
 * it stays out of that pass (and of the sections inside it): it's in the sections around the loop.
 * Changes `pages` and the sections' ranges in place.
 */
export function placeDetached(
  record: Pick<BrochureElement, "slots">,
  pages: ExpandedPage[],
  sections: ExpandedSection[],
): void {
  const levelOf = new Map<string, number>();
  for (const section of sections)
    if (!levelOf.has(section.from)) levelOf.set(section.from, section.level);
  record.slots.forEach((slot, i) => {
    if (!slot.detached || slot.generated) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const before = record.slots[j];
      const found = before ? pages.findIndex((page) => page.id === slotKey(before)) : -1;
      if (found >= 0) {
        at = found + 1;
        break;
      }
    }
    pages.splice(at, 0, {
      id: slot.id,
      from: slot.id,
      path: [],
      layers: [],
      made: true,
      printed: true,
    });
    // A section loop's passes, and what's inside them, are at its level or deeper.
    const loop = levelOf.get(slot.detached.owner);
    for (const section of sections) {
      if (section.first >= at) {
        section.first++;
        section.end++;
      } else if (
        section.end > at ||
        (section.end === at && (loop === undefined || section.level < loop))
      ) {
        section.end++;
      }
    }
  });
}
