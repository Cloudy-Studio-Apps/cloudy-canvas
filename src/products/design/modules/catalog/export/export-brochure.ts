import { encodePdfPages, imageSize, type PdfPage } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import type { DesignBrochure } from "../model";
import { drawFrame, partRect } from "./draw-frame";
import type { BrochureExportOptions } from "./export-brochure.types";
import { printedPages } from "./printed-pages";
import type { PrintedPage } from "./printed-pages.types";

/** Brochure pages print a world unit as a point: 72 to the inch. */
const UNITS_PER_INCH = 72;

/**
 * A brochure as one PDF, its pages as the layout prints them (`printedPages`: blanks added,
 * spread frames split or whole), each frame drawn exactly at the brochure's dpi, a world unit to a
 * point (an A4 frame is an A4 page). Frames are drawn on the brochure's design page; the workspace is
 * left on the page it was on.
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
  const scale = settings.dpi / UNITS_PER_INCH;
  const scope = workspace.scope;
  const drawn: PdfPage[] = [];
  try {
    // One at a time: each page is a large image.
    for (const page of printed) {
      drawn.push(await drawPage(workspace, page, scale));
      onProgress?.(drawn.length, printed.length);
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return encodePdfPages(drawn, { pointsPerUnit: 1 });
}

async function drawPage(
  workspace: DesignWorkspace,
  page: PrintedPage,
  scale: number,
): Promise<PdfPage> {
  if (page.kind === "blank") return { size: { width: page.size.w, height: page.size.h } };
  const { frame, part } = page;
  const file = await drawFrame(workspace, frame, { scale }, part);
  const jpeg = new Uint8Array(await file.arrayBuffer());
  // The image's real size (the export may have lowered the scale to fit a texture).
  const pixels = await imageSize(jpeg);
  if (!pixels) throw new Error(`The page “${frame.name}” couldn't be drawn.`);
  const { w, h } = partRect(frame, part);
  return { image: { jpeg, pixels }, size: { width: w, height: h } };
}
