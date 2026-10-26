import { CanvasDocument, type CanvasElement, type ElementKinds } from "@canvas";

import type { DesignToolOptions } from "../design-options.types";
import type { DesignMigration } from "../file";
import type { FigmaDesign, FigmaImport } from "./figma-import.types";

/**
 * A new design document from a converted Figma file (its pages, layers, images, variables and
 * styles, not an undo step), set up by the modules' migrations as an opened design is. Everything is added in one
 * transaction, so a large file doesn't pay for thousands of them.
 */
export function figmaDesignDocument(
  { name, elements, tokens, assets, warnings }: FigmaImport,
  kinds: ElementKinds<DesignToolOptions>,
  migrations: readonly DesignMigration[],
): FigmaDesign<CanvasDocument> {
  const doc = new CanvasDocument(kinds);
  for (const [id, data] of assets) doc.addAsset(id, data);
  doc.setTokenRecordsUntracked(tokens);
  doc.addAllUntracked(elements.map((el) => withOfferedBindings(el, kinds)));
  for (const migration of migrations) migration.migrate(doc);
  return { doc, name, warnings };
}

/** An element keeping only the bindings its kind offers (as the token sync would leave them). */
function withOfferedBindings(
  el: CanvasElement,
  kinds: ElementKinds<DesignToolOptions>,
): CanvasElement {
  if (!el.bindings) return el;
  const kind = kinds.kindOf(el);
  const kept = Object.fromEntries(
    Object.entries(el.bindings).filter(([path]) => kind?.bindsPath(el, path) ?? false),
  );
  if (Object.keys(kept).length === Object.keys(el.bindings).length) return el;
  return { ...el, bindings: kept };
}
