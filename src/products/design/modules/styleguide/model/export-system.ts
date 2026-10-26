import { encodePdfPages, imageSize, type PdfPage } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { isSheet } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { orderedCategories, settingsOf, systemPageOf } from "../system";
import type { SystemExportOptions } from "./export-system.types";

/** Pixels per world unit the sections are drawn at. */
const SCALE = 2;

/**
 * The Design system as one PDF: a page per section shown in the view, in its order, each sized
 * to its content. Drawn on the system page through the workspace, which is put back after.
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
  const drawn: PdfPage[] = [];
  try {
    if (workspace.scope !== page.id) workspace.setScope(page.id);
    for (const sheet of sheets) {
      const current = workspace.getElement(sheet.id) ?? sheet;
      const rect = { x: current.x, y: current.y, w: current.w, h: current.h };
      const file = await workspace.exportElements({
        format: "jpg",
        background: "solid",
        area: "board",
        ids: [sheet.id],
        rect,
        scale: SCALE,
      });
      const jpeg = new Uint8Array(await file.arrayBuffer());
      const pixels = await imageSize(jpeg);
      if (!pixels) throw new Error(`The section “${sheet.name}” couldn't be drawn.`);
      drawn.push({ image: { jpeg, pixels }, size: { width: rect.w, height: rect.h } });
      onProgress?.(drawn.length, sheets.length);
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return encodePdfPages(drawn);
}
