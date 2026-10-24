import { encodePdfPages, imageSize, type PdfPage } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_BROCHURE, type BrochurePage } from "../model";
import { drawFrame } from "./draw-frame";
import type { BrochureExportOptions } from "./export-brochure.types";

/** Brochure pages print a world unit as a point: 72 to the inch. */
const UNITS_PER_INCH = 72;

/**
 * The brochure as one PDF: each printed frame exactly (no padding), at the brochure's dpi, one
 * page after another, a world unit to a point (so an A4 frame is an A4 page). Pages on other
 * design pages are drawn there; the workspace is left on the page it was on.
 */
export async function exportBrochure(
  workspace: DesignWorkspace,
  { onProgress }: BrochureExportOptions = {},
): Promise<Blob> {
  const brochure = workspace.service(DESIGN_BROCHURE);
  const pages = brochure.pages();
  if (pages.length === 0) throw new Error("The brochure has no pages yet.");
  const scale = brochure.settings().dpi / UNITS_PER_INCH;
  const scope = workspace.scope;
  const drawn: PdfPage[] = [];
  try {
    // One at a time: each page is a large image.
    for (const page of pages) {
      drawn.push(await drawPage(workspace, page, scale));
      onProgress?.(drawn.length, pages.length);
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return encodePdfPages(drawn, { pointsPerUnit: 1 });
}

async function drawPage(
  workspace: DesignWorkspace,
  { frame }: BrochurePage,
  scale: number,
): Promise<PdfPage> {
  const jpeg = new Uint8Array(await (await drawFrame(workspace, frame, { scale })).arrayBuffer());
  // The image's real size (the export may have lowered the scale to fit a texture).
  const size = await imageSize(jpeg);
  if (!size) throw new Error(`The page “${frame.name}” couldn't be drawn.`);
  return { jpeg, pixels: size, size: { width: frame.w, height: frame.h } };
}
