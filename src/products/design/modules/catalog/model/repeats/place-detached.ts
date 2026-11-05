import type { BrochureElement, BrochureSlot } from "../../brochure";
import { slotKey } from "./slot-key";
import type { ExpandedPage, ExpandedSection } from "./expand-brochure.types";

/** A page taken out of a repeat as the expansion lists it: plain, outside every loop. */
export function detachedPage(slot: BrochureSlot): ExpandedPage {
  return { id: slot.id, from: slot.id, path: [], layers: [], made: true, printed: true };
}

/**
 * Puts the pages taken out of a repeat (`BrochureSlot.detached`) that don't stand in a page's
 * place (`placed`: those `expandBrochure` already listed where their page was, its
 * `detachedPages`; a whole copy taken out isn't walked) into an expansion, in place: each right
 * after the page of the slot before it in the record (the first that's in the expansion),
 * as a plain page outside every loop (no path, no layers), so the run goes on around it. It's in
 * the sections around that page, but at the end of a pass of the repeating section it came from
 * it stays out of that pass (and of the sections inside it): it's in the sections around the loop.
 * Changes `pages` and the sections' ranges in place.
 */
export function placeDetached(
  record: Pick<BrochureElement, "slots">,
  pages: ExpandedPage[],
  sections: ExpandedSection[],
  placed: ReadonlySet<string>,
): void {
  const levelOf = new Map<string, number>();
  for (const section of sections)
    if (!levelOf.has(section.from)) levelOf.set(section.from, section.level);
  record.slots.forEach((slot, i) => {
    if (!slot.detached || slot.generated || placed.has(slot.id)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const before = record.slots[j];
      const found = before ? pages.findIndex((page) => page.id === slotKey(before)) : -1;
      if (found >= 0) {
        at = found + 1;
        break;
      }
    }
    pages.splice(at, 0, detachedPage(slot));
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
