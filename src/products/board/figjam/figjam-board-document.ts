import { CanvasDocument, type ElementKinds } from "@canvas";
import { importWarningLines } from "@canvas/figma";

import type { BoardToolOptions } from "../board-options.types";
import type { BoardMigration } from "../file";
import { t } from "./figjam-import.i18n";
import type { FigJamBoard, FigJamImport } from "./figjam-import.types";

/**
 * A new board document from a converted FigJam file (its elements and images, not an undo step),
 * set up by the modules' migrations as an opened board is, with its warnings worded in the
 * user's language. Everything is added in one transaction, so a large board doesn't pay for
 * thousands of them.
 */
export function figjamBoardDocument(
  { name, elements, assets, warnings }: FigJamImport,
  kinds: ElementKinds<BoardToolOptions>,
  migrations: readonly BoardMigration[],
): FigJamBoard<CanvasDocument> {
  const doc = new CanvasDocument(kinds);
  for (const [id, data] of assets) doc.addAsset(id, data);
  doc.addAllUntracked(elements);
  for (const migration of migrations) migration.migrate(doc);
  const lines = importWarningLines(warnings, ({ code, values }) => t(`warnings.${code}`, values));
  return { doc, name, warnings: lines };
}
