import type { PdfBook, PdfBookLink } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { bleedFrame, isFrame } from "../../frame";
import { brochureContext, mmToUnits, pageNumbers, type DesignBrochure } from "../model";
import { brochureOutline } from "./brochure-outline";
import { partRect } from "./draw-frame";
import type { BrochureExportOptions } from "./export-brochure.types";
import { printedPages } from "./printed-pages";
import type { PrintedPage } from "./printed-pages.types";
import { printOptions } from "./print-options";
import { pageLinks } from "./page-links";
import { sidePdfPages } from "./side-pdf-pages";

/**
 * A brochure as one PDF, its pages as the layout prints them (`printedPages`: blanks added,
 * spread frames split or whole), a world unit to a point (an A4 frame is an A4 page). Pages are
 * sharp, with pictures at the brochure's dpi, or whole pictures at it (`pdfMode`). Its bookmarks
 * are the table of contents' entries (`brochureOutline`), and the contents' lines and page
 * references open their pages (`pageLinks`). Frames are read
 * on the brochure's design page; the workspace is left on the page it was on.
 */
export async function exportBrochure(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
  { onProgress }: BrochureExportOptions = {},
): Promise<Blob> {
  const pages = brochure.pages();
  if (pages.length === 0) throw new Error("The brochure has no pages yet.");
  const settings = brochure.settings();
  const layout = brochure.layout();
  const printed = printedPages(pages, layout, settings.splitSpreads);
  const record = brochure.record();
  const numbers = record ? pageNumbers(layout, record) : [];
  const context = record ? brochureContext(record, layout, numbers) : null;
  const pdfPages = sidePdfPages(printed, layout.sides.length);
  const linksOf = (page: PrintedPage) =>
    page.kind === "frame" && context
      ? pageLinks({ page, elements: workspace.doc.all(), layout, numbers, context, pdfPages })
      : [];
  const book = workspace.pdfBook(
    printOptions(settings, (id) => workspace.doc.getAsset(id), brochure.name),
  );
  const bleed = mmToUnits(settings.bleed);
  const scope = workspace.scope;
  try {
    for (const [done, page] of printed.entries()) {
      await addPage(book, workspace, page, bleed, linksOf(page));
      onProgress?.(done + 1, printed.length);
    }
    if (context) book.setOutline(brochureOutline(context.contents, pdfPages));
    return book.save();
  } finally {
    book.close();
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
}

async function addPage(
  book: PdfBook,
  workspace: DesignWorkspace,
  page: PrintedPage,
  bleed: number,
  links: readonly PdfBookLink[],
): Promise<void> {
  if (page.kind === "blank") {
    await book.addBlank(page.size);
    return;
  }
  const { frame, part } = page;
  if (workspace.scope !== frame.pageId) workspace.setScope(frame.pageId);
  await book.add({
    ids: [frame.id],
    rect: partRect(frame, part),
    prepare: (el) => (el.id === frame.id && isFrame(el) ? bleedFrame(el, bleed) : el),
    links,
  });
}
