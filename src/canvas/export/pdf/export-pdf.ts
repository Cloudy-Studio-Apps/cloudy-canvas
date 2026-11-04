import type { Rect } from "../../geometry.types";
import type { ExportHost } from "../export.types";
import { RGB_OUTPUT, type PdfColorOutput } from "./color";
import { PdfContent, PdfDocument } from "./pdf-document";
import { matrixOps } from "./pdf-matrix";
import { DEFAULT_PDF_OPTIONS, PDF_JPEG_QUALITY, pdfImageScale } from "./pdf-options";
import type { PdfExportOptions } from "./pdf-options.types";
import type { PdfLink } from "./pdf-links.types";
import { pdfPageLayout } from "./pdf-page-layout";
import { cropMarkOps, outsetRect } from "./print/print-layout";
import { addSvgPage } from "./svg-to-pdf";
import type { PdfPageSource } from "./pdf-writer.types";

/** What a flat page going to press shows where nothing's drawn. */
const PAPER = 0xffffff;
/** Keeps the image within what GPUs can render in one texture. */
const MAX_SIDE = 8192;

/**
 * Elements as a PDF of one page per `pages` entry. `sharp` keeps them vectors; a page that fails
 * falls back to `flattened`, so an export always gives a file.
 */
export async function exportPdf(
  host: ExportHost,
  pages: readonly PdfPageSource[],
  background: "solid" | "transparent",
  given: Partial<PdfExportOptions> = {},
): Promise<Blob> {
  const options = { ...DEFAULT_PDF_OPTIONS, ...given };
  const doc = new PdfDocument();
  for (const page of pages) await addPdfPage(doc, host, page, background, options, RGB_OUTPUT);
  return doc.save();
}

/** Writes one page into `doc`, sharp or flattened as `options` say. */
export async function addPdfPage(
  doc: PdfDocument,
  host: ExportHost,
  page: PdfPageSource,
  background: "solid" | "transparent",
  options: PdfExportOptions,
  output: PdfColorOutput,
  pageLinks: readonly PdfLink[] = [],
): Promise<void> {
  if (options.mode === "flattened")
    return addFlattened(doc, host, page, options, output, pageLinks);
  const { elements, rect, clips } = page;
  try {
    const svg = await host.vector(elements, {
      rect: drawnRect(rect, options),
      clips,
      background: background === "transparent" ? null : host.background,
      links: host.createLinks(),
      text: "outlines",
      target: "pdf",
      imageScale: pdfImageScale(options),
    });
    await addSvgPage(doc, svg, rect, options, output, pageLinks);
  } catch (error) {
    console.warn("Sharp PDF failed, exporting it flattened:", error);
    await addFlattened(doc, host, page, options, output, pageLinks);
  }
}

/** The elements as one JPEG on the page. */
async function addFlattened(
  doc: PdfDocument,
  host: ExportHost,
  { elements, rect, clips }: PdfPageSource,
  options: PdfExportOptions,
  output: PdfColorOutput,
  pageLinks: readonly PdfLink[],
): Promise<void> {
  const drawn = drawnRect(rect, options);
  const canvas = await host.snapshot(elements, {
    rect: drawn,
    clips,
    scale: Math.min(pdfImageScale(options), MAX_SIDE / Math.max(drawn.w, drawn.h)),
    background: options.print ? PAPER : host.background,
    links: host.createLinks(),
  });
  const image = await output.opaque(doc, canvas, PDF_JPEG_QUALITY[options.imageQuality]);
  const layout = pdfPageLayout(rect, options);
  const { scale, left, top } = layout;
  const w = drawn.w * scale;
  const h = drawn.h * scale;
  const x = left + (drawn.x - rect.x) * scale;
  const y = top - (drawn.y - rect.y) * scale - h;
  const content = new PdfContent();
  content.ops.push(`q ${matrixOps([w, 0, 0, h, x, y])} cm /${content.name("XObject", image)} Do Q`);
  if (options.print?.marks) content.ops.push(cropMarkOps(layout, output.registration));
  doc.addPage(layout, content, pageLinks);
}

/** The world area a page draws: past its trim by the bleed, when it has one. */
function drawnRect(rect: Rect, { print }: PdfExportOptions): Rect {
  return print ? outsetRect(rect, print.bleed) : rect;
}
