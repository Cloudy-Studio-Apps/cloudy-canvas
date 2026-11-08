import type { CanvasDocument } from "../document";
import { bakeRemoved } from "./bake-removed";
import { libraryIdOf } from "./library-tags";

/**
 * Takes a library's records out of the file as one undo step: the layers, styles and variables
 * using them keep what they gave, unlinked (`bakeRemoved`). Call it once the file's link no
 * longer lists the library (in the same undo step: `setProjectLink(link, { undoable: true })`):
 * the library sync then doesn't read the removal as an edit to the library, and the next mirror
 * doesn't bring the records back.
 */
export function detachLibrary(doc: CanvasDocument, libraryId: string): void {
  const ids = doc
    .tokenRecords()
    .filter((record) => libraryIdOf(record) === libraryId)
    .map((record) => record.id);
  if (ids.length === 0) return;
  doc.checkpoint();
  bakeRemoved(doc, ids);
}
