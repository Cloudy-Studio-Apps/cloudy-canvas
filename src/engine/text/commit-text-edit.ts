import type { BoardDocument } from "../document";
import { measureText } from "./text-metrics";
import type { TextEdit } from "./commit-text-edit.types";

/**
 * Writes an edit to the document. Text shapes resize to their content, empty drafts are dropped
 * and existing text emptied by the user is removed. Returns whether a new shape was added.
 */
export function commitTextEdit(doc: BoardDocument, { shape, text, isDraft }: TextEdit): boolean {
  if (shape.type === "sticky" || shape.type === "geo") {
    if (text !== shape.text) doc.update(shape.id, { text });
    return false;
  }

  const empty = text.trim() === "";
  const size = measureText(text, shape.fontSize);
  if (isDraft) {
    if (empty) return false;
    doc.checkpoint();
    doc.add({ ...shape, index: doc.nextIndex(), text, w: size.w, h: size.h });
    return true;
  }
  if (empty) doc.remove([shape.id]);
  else if (text !== shape.text) doc.update(shape.id, { text, w: size.w, h: size.h });
  return false;
}
