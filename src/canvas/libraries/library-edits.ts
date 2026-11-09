import type { CanvasDocument } from "../document";
import { isTokenRecord } from "../tokens/is-token-record";
import { deepEqual } from "../utils";
import { withoutView } from "./axis-view";
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
 *
 * A mode axis's `current` is the file's own view: a change of only that is no library edit, and
 * axes are put without it.
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
    const was = previous.get(id);
    const viewOnly =
      record?.kind === "axis" &&
      before === now &&
      isTokenRecord(was) &&
      deepEqual(withoutView(untaggedRecord(was)), withoutView(untaggedRecord(record)));
    if (record && now !== undefined && !viewOnly) {
      editOf(now).put.push(withoutView(untaggedRecord(record)));
    }
    if (before !== undefined && before !== now) editOf(before).removed.push(id);
  }
  return edits;
}
