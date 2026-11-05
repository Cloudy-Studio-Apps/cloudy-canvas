import type { CanvasDocument } from "@canvas";

import { dataPhase, documentScopes, rootScope, type DataScope } from "../../../data";
import type { BrochureElement } from "../../brochure";
import { expandBrochure } from "./expand-brochure";
import type { BrochureExpansion } from "./expand-brochure.types";
import { hasRepeats } from "./has-repeats";

/** No source at all: a brochure without repeats reads nothing (its section names stay as written). */
const NO_DATA: DataScope = rootScope([], () => null);

/**
 * A brochure's pages and sections with its repeats expanded (`expandBrochure`) over the document's
 * sources, in the document's data phase (`dataPhase`: an export's scratch copy makes every page).
 * A brochure without repeats reads no data.
 */
export function brochureExpansion(doc: CanvasDocument, record: BrochureElement): BrochureExpansion {
  const root = hasRepeats(record) ? documentScopes(doc).root : NO_DATA;
  return expandBrochure(record, root, dataPhase(doc));
}
