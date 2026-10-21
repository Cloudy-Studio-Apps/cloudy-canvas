import { createId } from "@core";

import { isErShape, type BoardDocument } from "../document";
import { erComponents } from "./er-components";

/**
 * Boards saved before a board could hold several ER diagrams have shapes without one. Each group
 * of connected shapes becomes its own diagram, so diagrams drawn side by side stay apart. Not an
 * undo step.
 */
export function migrateErDiagrams(doc: BoardDocument): void {
  const legacy = doc.all().filter((shape) => isErShape(shape) && shape.diagram === "");
  for (const ids of erComponents(legacy.filter(isErShape))) {
    const diagram = createId();
    for (const id of ids) doc.updateUntracked(id, { diagram, diagramName: "" });
  }
}
