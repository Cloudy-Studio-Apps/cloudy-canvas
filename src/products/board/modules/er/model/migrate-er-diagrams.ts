import { createId } from "@shared/core";
import type { CanvasDocument } from "@canvas";

import { isErElement } from "../base/is-er-element";
import { erComponents } from "./er-components";
import { patchEr } from "./patch-er-element";

/**
 * Boards saved before a board could hold several ER diagrams have shapes without one. Each group
 * of connected shapes becomes its own diagram, so diagrams drawn side by side stay apart. Not an
 * undo step.
 */
export function migrateErDiagrams(doc: CanvasDocument): void {
  const legacy = doc.all().filter((shape) => isErElement(shape) && shape.diagram === "");
  for (const ids of erComponents(legacy.filter(isErElement))) {
    const diagram = createId();
    for (const id of ids) patchEr(doc, id, { diagram, diagramName: "" }, true);
  }
}
