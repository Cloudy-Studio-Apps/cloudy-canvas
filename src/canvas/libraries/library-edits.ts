import type { CanvasDocument } from "../document";
import type { LibraryEdit } from "./library-edits.types";
import { libraryIdOf, untaggedRecord } from "./library-tags";

/**
 * The library records a change to a file's tokens wrote, by library id: of the records `ids`
 * (with their values before the change in `previous`, from `observeTokens`), those tagged now are
 * put (without the tag), and those that were tagged and are gone, untagged (the file's own now:
 * undoing a move to a library) or moved to another library are removed from their library. The
 * caller passes only the user's own changes (`source.local`), and only for libraries the file
 * uses, so taking a library out of a file (`detachLibrary`, after the link stops listing it) never
 * reaches it.
 */
export function libraryEditsOf(
  ids: ReadonlySet<string>,
  previous: ReadonlyMap<string, unknown>,
  doc: CanvasDocument,
): Map<string, LibraryEdit> {
  const edits = new Map<string, LibraryEdit>();
  const editOf = (libraryId: string) => {
    let edit = edits.get(libraryId);
    if (!edit) {
      edit = { put: [], removed: [] };
      edits.set(libraryId, edit);
    }
    return edit;
  };
  for (const id of ids) {
    const record = doc.tokenRecord(id);
    const now = record ? libraryIdOf(record) : undefined;
    const before = libraryIdOf(previous.get(id));
    if (record && now !== undefined) editOf(now).put.push(untaggedRecord(record));
    if (before !== undefined && before !== now) editOf(before).removed.push(id);
  }
  return edits;
}
