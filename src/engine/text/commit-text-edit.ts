import { isErNamed, type BoardDocument, type ErNamedShape } from "../document";
import { attributeSize, entitySize, relationSize } from "../er/er-size";
import type { Size } from "../geometry.types";
import { measureText } from "./text-metrics";
import type { TextEdit } from "./commit-text-edit.types";

/**
 * Writes an edit to the document. Text shapes resize to their content, empty drafts are dropped
 * and existing text emptied by the user is removed. Returns whether a new shape was added.
 */
export function commitTextEdit(doc: BoardDocument, { shape, text, isDraft }: TextEdit): boolean {
  if (shape.type === "section") {
    // A section always keeps a title; clearing it keeps the previous one.
    const title = text.trim();
    if (title && title !== shape.text) doc.update(shape.id, { text: title });
    return false;
  }
  if (isErNamed(shape)) {
    renameEr(doc, shape, text.trim());
    return false;
  }
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

/** ER names keep the previous one when cleared; the shape resizes round its center. */
function renameEr(doc: BoardDocument, shape: ErNamedShape, name: string): void {
  if (!name || name === shape.name) return;
  const size = erNameSize(shape, name);
  if (!size) return doc.update(shape.id, { name });
  doc.update(shape.id, {
    name,
    ...size,
    x: Math.round(shape.x + shape.w / 2 - size.w / 2),
    y: Math.round(shape.y + shape.h / 2 - size.h / 2),
  });
}

function erNameSize(shape: ErNamedShape, name: string): Size | null {
  if (shape.type === "er-entity") return entitySize(name);
  if (shape.type === "er-relation") return relationSize(name);
  if (shape.type === "er-attribute") return attributeSize(name, shape.look);
  return null;
}
