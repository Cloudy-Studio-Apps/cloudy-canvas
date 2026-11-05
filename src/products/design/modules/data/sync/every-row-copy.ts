import type { ExportCopyHook } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { isFrame } from "../../frame";
import { setDataPhase } from "../model/data-phase";
import { cappedRepeats, repeatOf } from "../repeat";
import { syncDataFor } from "./sync-data";

/**
 * Data's part in readying a copy of the design for an export (`designCanvas.exportCopies`): needed
 * when an iterator has rows past its design cap (`cappedRepeats`); on the copy, the data phase
 * becomes `"export"` and every iterator is brought in step, so each makes a copy of every row (the
 * pictures of those rows are already in the file: an Update saves every row's). What its writes
 * add runs the design's `afterEdit` as usual (nested iterators, brochure pages around them).
 */
export const everyRowCopy: ExportCopyHook<DesignToolOptions> = {
  needed: (doc) => cappedRepeats(doc),
  prepare: (doc, kinds) => {
    setDataPhase(doc, "export");
    const iterators = doc.all().flatMap((el) => (isFrame(el) && repeatOf(el) ? [el.id] : []));
    if (iterators.length > 0) syncDataFor(doc, iterators, kinds);
  },
};
