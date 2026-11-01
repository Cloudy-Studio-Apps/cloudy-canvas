import type { DesignWorkspace } from "../../../design-engine.types";
import { isSheet } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { orderedCategories, settingsOf, systemPageOf } from "../system";
import type { SystemExportOptions } from "./export-system.types";

/**
 * The Design system as one PDF: a sharp page per section shown in the view, in its order, each
 * sized to its content. Drawn on the system page through the workspace, which is put back after.
 */
export async function exportSystem(
  workspace: DesignWorkspace,
  categories: readonly StyleguideCategory[],
  { onProgress }: SystemExportOptions = {},
): Promise<Blob> {
  const page = systemPageOf(workspace.doc);
  if (!page) throw new Error("The design has no variables or styles yet.");
  const order = orderedCategories(categories, settingsOf(page)).map((category) => category.id);
  const sheets = workspace.doc
    .all()
    .filter(isSheet)
    .filter((sheet) => sheet.pageId === page.id && sheet.parentId === null)
    .sort((a, b) => order.indexOf(a.sheet.category) - order.indexOf(b.sheet.category));
  if (sheets.length === 0) throw new Error("The design system has no sections to export.");
  const scope = workspace.scope;
  const book = workspace.pdfBook();
  try {
    if (workspace.scope !== page.id) workspace.setScope(page.id);
    for (const [done, sheet] of sheets.entries()) {
      const { x, y, w, h } = workspace.getElement(sheet.id) ?? sheet;
      await book.add({ ids: [sheet.id], rect: { x, y, w, h } });
      onProgress?.(done + 1, sheets.length);
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return book.save();
}
