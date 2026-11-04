import type { CanvasElement } from "@canvas";

import type { BookLayout, PageInfo, TemplateContext } from "../model";
import type { PrintedPage } from "./printed-pages.types";

/** What finding a printed page's links reads. */
export interface PageLinksInput {
  page: Extract<PrintedPage, { kind: "frame" }>;
  /** Every element of the design. */
  elements: readonly CanvasElement[];
  layout: BookLayout;
  /** Each side's numbers (indexed like `layout.sides`). */
  numbers: readonly PageInfo[];
  /** What the brochure's page items read but a page's own (`brochureContext`). */
  context: Omit<TemplateContext, "info">;
  /** Each side's PDF page (`sidePdfPages`). */
  pdfPages: readonly number[];
}
