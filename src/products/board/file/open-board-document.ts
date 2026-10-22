import { CanvasDocument, type ElementKinds } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { migrateErDiagrams } from "../elements";
import { decodeBoardFile } from "./board-file";

/**
 * A board's document from its `.cboard` bytes, brought up to date: ER elements from before boards
 * held several diagrams are sorted into diagrams (not an undo step).
 */
export function openBoardDocument(
  bytes: Uint8Array,
  kinds: ElementKinds<BoardToolOptions>,
): CanvasDocument {
  const doc = CanvasDocument.fromUpdate(kinds, decodeBoardFile(bytes));
  migrateErDiagrams(doc);
  return doc;
}
