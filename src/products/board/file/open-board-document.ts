import { CanvasDocument } from "@canvas";

import { boardKinds, migrateErDiagrams } from "../elements";
import { decodeBoardFile } from "./board-file";

/**
 * A board's document from its `.cboard` bytes, brought up to date: ER elements from before boards
 * held several diagrams are sorted into diagrams (not an undo step).
 */
export function openBoardDocument(bytes: Uint8Array): CanvasDocument {
  const doc = CanvasDocument.fromUpdate(boardKinds, decodeBoardFile(bytes));
  migrateErDiagrams(doc);
  return doc;
}
