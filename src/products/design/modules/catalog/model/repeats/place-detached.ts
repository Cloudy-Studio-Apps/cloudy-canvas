import type { BrochureElement, BrochureSlot } from "../../brochure";
import { detachedRows } from "./detached-rows";
import { slotKey } from "./slot-key";
import type { ExpandedPage, ExpandedSection } from "./expand-brochure.types";

/** A page taken out of a repeat as the expansion lists it: plain, outside every loop. */
export function detachedPage(slot: BrochureSlot): ExpandedPage {
  return {
    id: slot.id,
    from: slot.id,
    path: [],
    rows: [],
    layers: [],
    made: true,
    printed: true,
  };
}

/** Whether `rows` are `prefix` or inside it (a page shown in that pass). */
const within = (rows: readonly string[], prefix: readonly string[]) =>
  prefix.length <= rows.length && prefix.every((segment, i) => rows[i] === segment);

/**
 * Puts the pages taken out of a repeat (`BrochureSlot.detached`) that don't stand in a page's
 * place (`placed`: those `expandBrochure` already listed where their page was, its
 * `detachedPages`; a whole copy taken out isn't walked) into an expansion, in place: each right
 * after the page of the slot before it in the record (the first that's in the expansion), as a
 * plain page outside every loop (no path, no layers), so the run goes on around it. It's only
 * ever in the sections it showed rows of (a section's `rows` a prefix of its own): never inside
 * another copy's (it goes after that copy instead), and at a section's end only in those it was
 * in. Changes `pages` and the sections' ranges in place.
 */
export function placeDetached(
  record: Pick<BrochureElement, "slots">,
  pages: ExpandedPage[],
  sections: ExpandedSection[],
  placed: ReadonlySet<string>,
): void {
  record.slots.forEach((slot, i) => {
    const { detached } = slot;
    if (!detached || slot.generated || placed.has(slot.id)) return;
    const rows = detachedRows(detached);
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const before = record.slots[j];
      const found = before ? pages.findIndex((page) => page.id === slotKey(before)) : -1;
      if (found >= 0) {
        at = found + 1;
        break;
      }
    }
    // Not inside a section it wasn't in (another copy's): after it.
    for (let moved = true; moved;) {
      moved = false;
      for (const section of sections) {
        if (section.first < at && at < section.end && !within(rows, section.rows)) {
          at = section.end;
          moved = true;
        }
      }
    }
    pages.splice(at, 0, detachedPage(slot));
    for (const section of sections) {
      if (section.first >= at) {
        section.first++;
        section.end++;
      } else if (section.end > at || (section.end === at && within(rows, section.rows))) {
        section.end++;
      }
    }
  });
}
