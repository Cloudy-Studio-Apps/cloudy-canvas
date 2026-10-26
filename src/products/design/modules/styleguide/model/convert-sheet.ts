import type { CanvasDocument, ElementPatch } from "@canvas";

import { generatedMark, isSheet } from "../sheet";
import { isSystemPage } from "../system";

/**
 * Turns live elements into ordinary layers (Convert to design): each stops being a sheet, and
 * what it generated becomes the user's, unlocked and editable, keeping its variable links. The
 * system page's sheets are left alone (the sync keeps them). No undo step of its own: callers
 * make one. Returns the converted sheets' ids.
 */
export function convertSheets(doc: CanvasDocument, ids: readonly string[]): string[] {
  const sheets = ids
    .map((id) => doc.get(id))
    .filter(isSheet)
    .filter((sheet) => !isSystemPage(doc.get(sheet.pageId)));
  if (sheets.length === 0) return [];
  const converted = new Set(sheets.map((sheet) => sheet.id));
  const patches = new Map<string, ElementPatch>();
  // A patch can't delete a field: `null` reads as none (see `isSheet`, `generatedMark`).
  for (const sheet of sheets) patches.set(sheet.id, { sheet: null } as ElementPatch);
  for (const el of doc.all()) {
    const mark = generatedMark(el);
    if (mark && converted.has(mark.sheet)) {
      patches.set(el.id, { generated: null, locked: false } as ElementPatch);
    }
  }
  doc.updateMany(patches);
  return [...converted];
}
