import type { PdfBook } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import type { DesignBrochure } from "../model";
import { partRect } from "./draw-frame";
import type { BrochureExportOptions } from "./export-brochure.types";
import { printedPages } from "./printed-pages";
import type { PrintedPage } from "./printed-pages.types";

/**
 * A brochure as one PDF, its pages as the layout prints them (`printedPages`: blanks added,
 * spread frames split or whole), a world unit to a point (an A4 frame is an A4 page). Pages are
 * sharp, with pictures at the brochure's dpi, or whole pictures at it (`pdfMode`). Frames are read
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
  const printed = printedPages(pages, brochure.layout(), settings.splitSpreads);
  const book = workspace.pdfBook({
    mode: settings.pdfMode,
    dpi: settings.dpi,
    pointsPerUnit: 1,
  });
  const scope = workspace.scope;
  try {
    for (const [done, page] of printed.entries()) {
      await addPage(book, workspace, page);
      onProgress?.(done + 1, printed.length);
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return book.save();
}

async function addPage(
  book: PdfBook,
  workspace: DesignWorkspace,
  page: PrintedPage,
): Promise<void> {
  if (page.kind === "blank") {
    book.addBlank(page.size);
    return;
  }
  const { frame, part } = page;
  if (workspace.scope !== frame.pageId) workspace.setScope(frame.pageId);
  await book.add({ ids: [frame.id], rect: partRect(frame, part) });
}
