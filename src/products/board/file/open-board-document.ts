import { CanvasDocument, type ElementKinds } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { decodeBoardFile } from "./board-file";
import type { BoardMigration } from "./board-migration.types";

/**
 * A board's document from its `.cboard` bytes, brought up to date by the modules' migrations (in
 * module order, not an undo step).
 */
export function openBoardDocument(
  bytes: Uint8Array,
  kinds: ElementKinds<BoardToolOptions>,
  migrations: readonly BoardMigration[],
): CanvasDocument {
  const doc = CanvasDocument.fromUpdate(kinds, decodeBoardFile(bytes));
  for (const migration of migrations) migration.migrate(doc);
  return doc;
}
