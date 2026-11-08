import type { CanvasDocument } from "../document";
import { bakeRemoved } from "./bake-removed";
import { libraryIdOf, untaggedRecord } from "./library-tags";

/**
 * Takes a library's records out of the file as one undo step: the layers, styles and variables
 * using them keep what they gave, unlinked (`bakeRemoved`). The records lose their tag first, in
 * a transaction of their own, so the library sync never reads their removal as an edit to the
 * library (a record that lost its tag stays in its library). Call it once the file's link no
 * longer lists the library, or the next mirror brings the records back.
 */
export function detachLibrary(doc: CanvasDocument, libraryId: string): void {
  const records = doc.tokenRecords().filter((record) => libraryIdOf(record) === libraryId);
  if (records.length === 0) return;
  doc.checkpoint();
  const release = doc.holdCheckpoints();
  try {
    doc.batch(() => doc.setTokenRecords(records.map(untaggedRecord)));
    bakeRemoved(
      doc,
      records.map((record) => record.id),
    );
  } finally {
    release();
  }
}
