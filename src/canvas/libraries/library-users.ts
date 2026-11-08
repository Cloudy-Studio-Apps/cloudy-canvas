import type { CanvasDocument } from "../document";
import { BindingIndex } from "../tokens/binding-index";
import { libraryIdOf } from "./library-tags";

/** The layers bound to a variable or style of the library `libraryId` (by id). */
export function libraryUsers(doc: CanvasDocument, libraryId: string): Set<string> {
  const index = BindingIndex.of(doc);
  const users = new Set<string>();
  for (const record of doc.tokenRecords()) {
    if (libraryIdOf(record) !== libraryId) continue;
    if (record.kind !== "variable" && record.kind !== "style") continue;
    for (const id of index.boundTo(record.id)) users.add(id);
  }
  return users;
}
