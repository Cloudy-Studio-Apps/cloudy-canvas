import { CanvasDocument, type ElementKinds } from "@canvas";

import type { DesignToolOptions } from "../design-options.types";
import type { DesignMigration } from "../file";
import type { FigmaDesign, FigmaImport } from "./figma-import.types";

/**
 * A new design document from a converted Figma file (its pages, layers and images, not an undo
 * step), set up by the modules' migrations as an opened design is. Everything is added in one
 * transaction, so a large file doesn't pay for thousands of them.
 */
export function figmaDesignDocument(
  { name, elements, assets, warnings }: FigmaImport,
  kinds: ElementKinds<DesignToolOptions>,
  migrations: readonly DesignMigration[],
): FigmaDesign<CanvasDocument> {
  const doc = new CanvasDocument(kinds);
  for (const [id, data] of assets) doc.addAsset(id, data);
  doc.addAllUntracked(elements);
  for (const migration of migrations) migration.migrate(doc);
  return { doc, name, warnings };
}
