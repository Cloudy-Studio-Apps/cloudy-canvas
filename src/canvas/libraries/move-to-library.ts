import type { CanvasDocument } from "../document";
import type { TokenRecord } from "../tokens/token.types";
import { planLibraryMove } from "./library-move-plan";
import { taggedRecord } from "./library-tags";

/**
 * Moves the file's own variables, collections or styles `ids` to the library `libraryId` as one
 * undo step, by tagging them (and what goes with them, `planLibraryMove`) with the library's id:
 * an ordinary edit of the file, which the editor's library sync then writes to the library.
 * Returns the records as tagged. Throws when they read something that stays behind (check the
 * plan's `blockers` first).
 */
export function moveToLibrary(
  doc: CanvasDocument,
  ids: readonly string[],
  libraryId: string,
): TokenRecord[] {
  const plan = planLibraryMove(doc, ids, libraryId);
  if (plan.blockers.length > 0) {
    const names = plan.blockers.map((record) => record.name).join(", ");
    throw new Error(`These read records that would stay in the file: ${names}.`);
  }
  if (plan.records.length === 0) return [];
  const tagged = plan.records.map((record) => taggedRecord(record, libraryId));
  doc.checkpoint();
  doc.batch(() => doc.setTokenRecords(tagged));
  return tagged;
}
