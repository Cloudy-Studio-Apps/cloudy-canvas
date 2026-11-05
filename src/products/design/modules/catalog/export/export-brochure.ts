import type { PdfBook, PdfBookLink } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { bleedFrame, isFrame } from "../../frame";
import {
  brochureContext,
  DESIGN_BROCHURES,
  mmToUnits,
  pageNumbers,
  type DesignBrochure,
} from "../model";
import { brochureOutline } from "./brochure-outline";
import { brochureSources } from "./brochure-sources";
import { needsBrochureCopy, prepareBrochureCopy } from "./brochure-export-copy";
import { partRect } from "./draw-frame";
import type { BrochureExport, BrochureExportOptions } from "./export-brochure.types";
import { printedPages } from "./printed-pages";
import type { PrintedPage } from "./printed-pages.types";
import { printOptions } from "./print-options";
import { pageLinks } from "./page-links";
import { sidePdfPages } from "./side-pdf-pages";
import { updateBrochureSources } from "./update-brochure-sources";

/** Lets the window paint (the loading screen's step) before a long synchronous stretch. */
const breathe = () =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame !== "function") setTimeout(resolve, 0);
    else requestAnimationFrame(() => setTimeout(resolve, 0));
  });

/**
 * A brochure as one PDF, every page it prints. With `data: "update"` the sources it reads
 * (`brochureSources`) are updated first, in the workspace's history (`updateBrochureSources`: a
 * failure throws and nothing is exported); `"saved"`, the default, reads them as they are. When
 * the document holds fewer pages than the export must print (`needsBrochureCopy`: repeats' pending
 * pages, template pages showing their preview row, card repeaters past their design caps), every
 * page is made on a copy of the design readied for the export (`exportCopy`,
 * `prepareBrochureCopy`) and printed from there; the user's file never changes. The copy is
 * dropped however the export ends.
 */
export async function exportBrochure(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
  options: BrochureExportOptions = {},
): Promise<BrochureExport> {
  const { data = "saved", onStep } = options;
  const before = brochure.record();
  if (before && data === "update") {
    const ids = brochureSources(workspace.doc, before).map((source) => source.id);
    await updateBrochureSources(workspace, ids, (source) => onStep?.({ step: "updating", source }));
  }
  const record = brochure.record();
  if (!record || !needsBrochureCopy(workspace.doc, record)) {
    return printBrochure(workspace, brochure, options);
  }
  onStep?.({ step: "making" });
  await breathe();
  const copy = workspace.exportCopy();
  try {
    prepareBrochureCopy(copy.workspace, brochure.id);
    const made = copy.workspace.service(DESIGN_BROCHURES).get(brochure.id);
    if (!made) throw new Error("The brochure is gone.");
    return await printBrochure(copy.workspace, made, options);
  } finally {
    copy.dispose();
  }
}

/**
 * The brochure's PDF as the workspace's document holds it, its pages as the layout prints them
 * (`printedPages`: blanks added, spread frames split or whole), a world unit to a point (an A4
 * frame is an A4 page). Pages are sharp, with pictures at the brochure's dpi, or whole pictures at
 * it (`pdfMode`). Its bookmarks are the table of contents' entries (`brochureOutline`), and the
 * contents' lines and page references open their pages (`pageLinks`). Frames are read on the
 * brochure's design page; the workspace is left on the page it was on.
 */
async function printBrochure(
  workspace: DesignWorkspace,
  brochure: DesignBrochure,
  { onProgress }: BrochureExportOptions,
): Promise<BrochureExport> {
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
    return { file: await book.save(), pages: printed.length };
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
