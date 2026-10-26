import type { CanvasDocument, ElementPatch } from "@canvas";

import { withDescendants } from "../../core";
import { isSheet, type SystemPage } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { orderedCategories } from "./ordered-categories";
import { settingsOf } from "./system-page";

/** The space between the system page's sheets. */
const SHEET_SPACING = 200;

/**
 * Stacks the system page's sheets in the view's category order, top to bottom from the page's
 * origin, moving each with what it holds; only what's out of place moves.
 */
export function stackSystemSheets(
  doc: CanvasDocument,
  page: SystemPage,
  categories: readonly StyleguideCategory[],
): void {
  const all = doc.all();
  const sheets = all.filter(isSheet).filter((el) => el.pageId === page.id && el.parentId === null);
  const order = orderedCategories(categories, settingsOf(page)).map((category) => category.id);
  sheets.sort((a, b) => order.indexOf(a.sheet.category) - order.indexOf(b.sheet.category));
  const patches = new Map<string, ElementPatch>();
  let y = 0;
  for (const sheet of sheets) {
    const dx = -sheet.x;
    const dy = y - sheet.y;
    y += sheet.h + SHEET_SPACING;
    if (dx === 0 && dy === 0) continue;
    for (const id of withDescendants(new Set([sheet.id]), all)) {
      const el = doc.get(id);
      if (el) patches.set(id, { x: el.x + dx, y: el.y + dy });
    }
  }
  if (patches.size > 0) doc.updateMany(patches);
}
