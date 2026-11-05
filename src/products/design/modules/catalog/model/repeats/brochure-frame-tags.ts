import type { CanvasDocument } from "@canvas";

import { brochuresOf } from "../design-brochures";
import { brochureExpansion } from "./brochure-expansion";
import { segmentOwner } from "./copy-segment";
import type { ExpandedPage } from "./expand-brochure.types";
import { hasRepeats } from "./has-repeats";
import { loopOwner } from "./loop-owner";
import { rowsPerPage } from "./loop-units";
import { t } from "../../catalog.i18n";

/**
 * The words after each brochure page frame's name on the canvas: a template page of a repeat
 * (its innermost loop) "Product · row 2 of 40" (a page repeat with several rows a page, "page 2
 * of 10"; "not printed for this row" when its list is empty there, "data not on this device"
 * when it can't be read), a page a repeat made "Copy of Product" (the loop that made it). Read
 * from each brochure's remembered expansion (`brochureExpansion`), never expanded again.
 */
export function brochureFrameTags(doc: CanvasDocument): Map<string, string> {
  const out = new Map<string, string>();
  for (const record of brochuresOf(doc).records()) {
    const repeats = hasRepeats(record);
    if (!repeats && !record.slots.some((slot) => slot.generated)) continue;
    const pages = new Map<string, ExpandedPage>(
      repeats ? brochureExpansion(doc, record).pages.map((page) => [page.id, page]) : [],
    );
    for (const slot of record.slots) {
      let tag: string | null = null;
      if (slot.generated) {
        const last = slot.generated.path.at(-1);
        const owner = last === undefined ? null : loopOwner(doc, record, segmentOwner(last));
        if (owner) tag = t("canvas.tag.copy", { label: owner.name });
      } else {
        const page = pages.get(slot.id);
        const layer = page?.layers.at(-1);
        const owner = layer ? loopOwner(doc, record, layer.owner) : null;
        if (page && layer && owner) {
          const label = owner.name;
          tag = !page.printed
            ? t("canvas.tag.notPrinted", { label })
            : layer.unreadable
              ? t("canvas.tag.unreadable", { label })
              : t(rowsPerPage(owner.repeat) > 1 ? "canvas.tag.page" : "canvas.tag.row", {
                  label,
                  n: layer.index + 1,
                  count: layer.count,
                });
        }
      }
      if (tag) for (const id of slot.frames) out.set(id, tag);
    }
  }
  return out;
}
