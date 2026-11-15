import type { CanvasDocument } from "@canvas";

import { dataSourcesIn } from "../../data";
import { isBrochure } from "../brochure";

/**
 * A page split out into a new file keeps its brochures (their slots, masters, sections and
 * settings name the page's frames by id, which the copy keeps), and the data sources when one of
 * them repeats rows. Nothing when the page has no brochure.
 */
export function copyBrochuresForSplit(
  source: CanvasDocument,
  target: CanvasDocument,
  pageId: string,
): void {
  const brochures = source.all().filter((el) => isBrochure(el) && el.page === pageId);
  if (brochures.length === 0) return;
  target.addAllUntracked(brochures);
  const repeats = brochures.some(
    (el) =>
      isBrochure(el) &&
      (el.slots.some((slot) => slot.repeat) || el.sections.some((section) => section.repeat)),
  );
  // shortcut: copies every source, as the data step does; narrow both together
  if (repeats) target.addAllUntracked(dataSourcesIn(source));
}
