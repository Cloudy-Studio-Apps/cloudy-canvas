import type { CanvasDocument, ElementPatch } from "@canvas";

import type { DbEnumElement } from "../enum";
import type { DbTableElement } from "../table";

// Typed `doc.update` for schema elements: the document takes any element's patch, so these check
// the fields against the table or enum.

export function patchTable(
  doc: CanvasDocument,
  id: string,
  patch: ElementPatch<DbTableElement>,
): void {
  doc.update(id, patch);
}

export function patchEnum(
  doc: CanvasDocument,
  id: string,
  patch: ElementPatch<DbEnumElement>,
): void {
  doc.update(id, patch);
}
