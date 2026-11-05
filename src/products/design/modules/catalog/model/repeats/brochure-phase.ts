import type { CanvasDocument } from "@canvas";

import type { DataPhase } from "../../../data";

/** The Yjs docs whose brochures are being exported (a brochure export's copy of the design). */
const EXPORTING = new WeakSet<object>();

/**
 * The phase brochure page loops expand in: `"export"` (every page made, template pages from their
 * first row) only on the copy a brochure export readied (`setBrochureExport`), `"design"`
 * everywhere else, a design export's copy included (its card repeaters make every row, `dataPhase`,
 * while the brochure's pages stay as the canvas shows them). Shared by every view of the same Yjs
 * doc, kept in memory only.
 */
export function brochurePhase(doc: CanvasDocument): DataPhase {
  return EXPORTING.has(doc.doc) ? "export" : "design";
}

/** Marks a document's copy as a brochure export's: its page loops make every page. */
export function setBrochureExport(doc: CanvasDocument): void {
  EXPORTING.add(doc.doc);
}
