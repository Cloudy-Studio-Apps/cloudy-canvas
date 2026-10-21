import type { CanvasDocument } from "../document";

/** Runs `edit` as its own undo step, so the user can undo one agent call with one Ctrl+Z. */
export function asUndoStep<T>(doc: CanvasDocument, edit: () => T): T {
  let result!: T;
  doc.checkpoint();
  doc.batch(() => {
    result = edit();
  });
  doc.checkpoint();
  return result;
}
