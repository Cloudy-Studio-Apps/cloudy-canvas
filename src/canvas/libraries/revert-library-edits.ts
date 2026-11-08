import type { CanvasDocument } from "../document";
import { isTokenRecord } from "../tokens/is-token-record";
import type { TokenRecord } from "../tokens/token.types";
import { bakeRemoved } from "./bake-removed";
import { libraryEditsOf } from "./library-edits";
import { libraryIdOf } from "./library-tags";
import { writeUntracked } from "./untracked";

/**
 * Puts back the library records a change wrote (`ids` and their earlier values in `previous`,
 * from `observeTokens`), untracked: for a file whose project can't be found, whose library items
 * can't be edited. Records the change added are removed. Returns whether it reverted anything.
 */
export function revertLibraryEdits(
  doc: CanvasDocument,
  ids: ReadonlySet<string>,
  previous: ReadonlyMap<string, unknown>,
): boolean {
  if (libraryEditsOf(ids, previous, doc).size === 0) return false;
  const restore: TokenRecord[] = [];
  const added: string[] = [];
  for (const id of ids) {
    const before = previous.get(id);
    const touched =
      libraryIdOf(before) !== undefined || libraryIdOf(doc.tokenRecord(id)) !== undefined;
    if (!touched) continue;
    if (isTokenRecord(before)) restore.push(before);
    else added.push(id);
  }
  writeUntracked(doc, () => {
    if (restore.length > 0) doc.setTokenRecords(restore);
    if (added.length > 0) bakeRemoved(doc, added);
  });
  return true;
}
