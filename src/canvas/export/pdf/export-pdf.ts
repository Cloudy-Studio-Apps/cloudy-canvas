import { canvasBlob } from "../canvas-blob";
import type { ExportHost } from "../export.types";
import { PdfContent, PdfDocument } from "./pdf-document";
import { embedJpeg } from "./pdf-image";
import { matrixOps } from "./pdf-matrix";
import { DEFAULT_PDF_OPTIONS, PDF_JPEG_QUALITY, pdfImageScale } from "./pdf-options";
import type { PdfExportOptions } from "./pdf-options.types";
import { pdfPageLayout } from "./pdf-page-layout";
import { addSvgPage } from "./svg-to-pdf";
import type { PdfPageSource } from "./pdf-writer.types";

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
  for (const page of pages) await addPdfPage(doc, host, page, background, options);
  return doc.save();
}

/** Writes one page into `doc`, sharp or flattened as `options` say. */
export async function addPdfPage(
  doc: PdfDocument,
  host: ExportHost,
  page: PdfPageSource,
  background: "solid" | "transparent",
  options: PdfExportOptions,
): Promise<void> {
  if (options.mode === "flattened") return addFlattened(doc, host, page, options);
  const { elements, rect } = page;
  try {
    const svg = await host.vector(elements, {
      rect,
      background: background === "transparent" ? null : host.background,
      links: host.createLinks(),
      text: "outlines",
      target: "pdf",
      imageScale: pdfImageScale(options),
    });
    await addSvgPage(doc, svg, rect, options);
  } catch (error) {
    console.warn("Sharp PDF failed, exporting it flattened:", error);
    await addFlattened(doc, host, page, options);
  }
}

/** The elements as one JPEG on the page. */
async function addFlattened(
  doc: PdfDocument,
  host: ExportHost,
  { elements, rect }: PdfPageSource,
  options: PdfExportOptions,
): Promise<void> {
  const canvas = await host.snapshot(elements, {
    rect,
    scale: Math.min(pdfImageScale(options), MAX_SIDE / Math.max(rect.w, rect.h)),
    background: host.background,
    links: host.createLinks(),
  });
  const jpeg = await canvasBlob(canvas, "image/jpeg", PDF_JPEG_QUALITY[options.imageQuality]);
  const image = embedJpeg(doc, new Uint8Array(await jpeg.arrayBuffer()), canvas);
  const layout = pdfPageLayout(rect, options);
  const { scale, left, top } = layout;
  const w = rect.w * scale;
  const h = rect.h * scale;
  const content = new PdfContent();
  content.ops.push(
    `q ${matrixOps([w, 0, 0, h, left, top - h])} cm /${content.name("XObject", image)} Do Q`,
  );
  doc.addPage(layout, content);
}
