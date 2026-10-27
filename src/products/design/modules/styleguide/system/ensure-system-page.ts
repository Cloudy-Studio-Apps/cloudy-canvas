import { generateKeyBetween } from "fractional-indexing";

import type { CanvasDocument, TokenStore } from "@canvas";

import { withDescendants } from "../../core";
import { allPagesOf, createPage } from "../../pages";
import { createSheet, isSheet, safeGroups, type SheetFrame, type SystemPage } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { orderedCategories } from "./ordered-categories";
import { DEFAULT_STYLEGUIDE_SETTINGS, settingsOf, systemPageOf } from "./system-page";
import { t } from "../styleguide.i18n";

/** The system page's name, as collaborators see it. */
const SYSTEM_PAGE_NAME = t("defaults.systemPage");

/**
 * Keeps the system page as the tokens call for, in the edit's undo step: made with the file's
 * first variable or style, gone with its last; on it, one sheet per category that has tokens and
 * isn't hidden. Returns the page, if there is one.
 */
export function ensureSystemPage(
  doc: CanvasDocument,
  store: TokenStore,
  categories: readonly StyleguideCategory[],
): SystemPage | undefined {
  let page = systemPageOf(doc);
  const hasTokens = store.variables().length > 0 || store.styles().length > 0;
  if (!hasTokens) {
    if (page) {
      const id = page.id;
      const nodes = doc.all().filter((el) => (el as { pageId?: string }).pageId === id);
      doc.remove([id, ...nodes.map((el) => el.id)]);
    }
    return undefined;
  }
  if (!page) {
    const last = allPagesOf(doc).at(-1);
    page = {
      ...createPage(SYSTEM_PAGE_NAME, generateKeyBetween(last?.index ?? null, null)),
      hidden: true,
      styleguide: DEFAULT_STYLEGUIDE_SETTINGS,
    };
    doc.add(page);
  }
  const settings = settingsOf(page);
  const all = doc.all();
  const sheets = all.filter((el) => isSheet(el) && el.pageId === page.id && el.parentId === null);
  const wanted = new Set(
    orderedCategories(categories, settings)
      .filter((category) => !settings.hidden.includes(category.id))
      .filter((category) => safeGroups(category, store, doc).length > 0)
      .map((category) => category.id),
  );
  const unwanted = sheets.filter((el) => !isSheet(el) || !wanted.has(el.sheet.category));
  if (unwanted.length > 0) {
    doc.remove(withDescendants(new Set(unwanted.map((el) => el.id)), all));
  }
  const have = new Set(sheets.filter(isSheet).map((el) => el.sheet.category));
  const pageId = page.id;
  for (const category of categories) {
    if (!wanted.has(category.id) || have.has(category.id)) continue;
    const sheet = createSheet(
      { category: category.id },
      category.label,
      { x: 0, y: 0 },
      doc.nextIndex(),
      null,
    );
    const placed: SheetFrame = { ...sheet, pageId };
    doc.add(placed);
  }
  return page;
}
