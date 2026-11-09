import type { CanvasDocument, DocumentActor } from "../document";
import { UI_ORIGIN } from "../document/canvas-document";

/** Who library syncs write as: no undo history records it, the after-edit hook still runs. */
const UNTRACKED: DocumentActor = { origin: UI_ORIGIN, placement: null };

/**
 * Runs `fn`'s edits as one transaction outside every undo history, with the after-edit hook (the
 * token sync) running on them as on any edit. `observeTokens` reports them as not `local`.
 */
export function writeUntracked(doc: CanvasDocument, fn: () => void): void {
  doc.runAs(UNTRACKED, () => doc.batch(fn));
}
