import type { CanvasDocument } from "../document";
import type { LibraryEdit } from "./library-edits.types";
import { libraryIdOf, untaggedRecord } from "./library-tags";

/**
 * The library records a change to a file's tokens wrote, by library id: of the records `ids`
 * (with their values before the change in `previous`, from `observeTokens`), those tagged now are
 * put (without the tag), and those that were tagged and are gone, or moved to another library,
 * are removed from their library. The caller passes only the user's own changes (`source.local`).
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
    // A record still in the file but no longer tagged stays in its library.
    if (before !== undefined && before !== now && (!record || now !== undefined)) {
      editOf(before).removed.push(id);
    }
  }
  return edits;
}
