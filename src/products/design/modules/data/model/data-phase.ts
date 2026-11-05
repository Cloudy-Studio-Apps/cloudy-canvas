import type { CanvasDocument } from "@canvas";

import { sharedState } from "./shared-state";
import type { DataPhase } from "./shared-state.types";

/**
 * The document's data phase: `"design"` (the default) makes repeats' design caps of copies,
 * `"export"` every row (an export's scratch copy of the document). Shared by every view of the
 * same Yjs doc, kept in memory only.
 */
export function dataPhase(doc: CanvasDocument): DataPhase {
  return sharedState(doc).phase;
}

/** Sets the document's data phase; the next sync makes the copies it asks for. */
export function setDataPhase(doc: CanvasDocument, phase: DataPhase): void {
  sharedState(doc).phase = phase;
}
