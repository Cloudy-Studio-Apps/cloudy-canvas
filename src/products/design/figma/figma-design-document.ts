import { CanvasDocument, type ElementKinds } from "@canvas";

import type { DesignToolOptions } from "../design-options.types";
import type { DesignMigration } from "../file";
import { readFigFile } from "./container";
import { convertFigma } from "./convert/convert-figma";
import type { FigmaDesign } from "./figma-import.types";

/**
 * A new design document from a `.fig` file's bytes (its pages, layers and images, not an undo
 * step), set up by the modules' migrations as an opened design is. Throws for files it can't
 * read (FigJam, Slides, other files).
 */
export function figmaDesignDocument(
  bytes: Uint8Array,
  kinds: ElementKinds<DesignToolOptions>,
  migrations: readonly DesignMigration[],
): FigmaDesign<CanvasDocument> {
  const { name, elements, assets, warnings } = convertFigma(readFigFile(bytes));
  const doc = new CanvasDocument(kinds);
  for (const [id, data] of assets) doc.addAsset(id, data);
  for (const el of elements) doc.addUntracked(el);
  for (const migration of migrations) migration.migrate(doc);
  return { doc, name, warnings };
}
