import { canvasBlob } from "../canvas-blob";
import type { ExportHost } from "../export.types";
import type { CanvasElement } from "../../elements";
import type { Rect } from "../../geometry.types";
import { PdfContent, PdfDocument } from "./pdf-document";
import { embedJpeg } from "./pdf-image";
import { matrixOps } from "./pdf-matrix";
import { DEFAULT_PDF_OPTIONS, PDF_JPEG_QUALITY, pdfImageScale } from "./pdf-options";
import type { PdfExportOptions } from "./pdf-options.types";
import { pdfPageLayout } from "./pdf-page-layout";
import { svgToPdf } from "./svg-to-pdf";

/** Keeps the image within what GPUs can render in one texture. */
const MAX_SIDE = 8192;

/**
 * Elements as a one-page PDF: `sharp` keeps them vectors, and falls back to `flattened` if that
 * fails, so an export always gives a file.
 */
export async function exportPdf(
  host: ExportHost,
  elements: readonly CanvasElement[],
  rect: Rect,
  background: "solid" | "transparent",
  given: Partial<PdfExportOptions> = {},
): Promise<Blob> {
  const options = { ...DEFAULT_PDF_OPTIONS, ...given };
  if (options.mode === "flattened") return flattened(host, elements, rect, options);
  try {
    const svg = await host.vector(elements, {
      rect,
      background: background === "transparent" ? null : host.background,
      links: host.createLinks(),
      text: "outlines",
      target: "pdf",
      imageScale: pdfImageScale(options.dpi),
    });
    return await svgToPdf(svg, rect, options);
  } catch (error) {
    console.warn("Sharp PDF failed, exporting it flattened:", error);
    return flattened(host, elements, rect, options);
  }
}

/** The elements as one JPEG on the page. */
async function flattened(
  host: ExportHost,
  elements: readonly CanvasElement[],
  rect: Rect,
  options: PdfExportOptions,
): Promise<Blob> {
  const canvas = await host.snapshot(elements, {
    rect,
    scale: Math.min(pdfImageScale(options.dpi), MAX_SIDE / Math.max(rect.w, rect.h)),
    background: host.background,
    links: host.createLinks(),
  });
  const jpeg = await canvasBlob(canvas, "image/jpeg", PDF_JPEG_QUALITY[options.imageQuality]);
  const doc = new PdfDocument();
  const image = embedJpeg(doc, new Uint8Array(await jpeg.arrayBuffer()), canvas);
  const layout = pdfPageLayout(rect, options);
  const { scale, left, top } = layout;
  const w = rect.w * scale;
  const h = rect.h * scale;
  const content = new PdfContent();
  content.ops.push(
    `q ${matrixOps([w, 0, 0, h, left, top - h])} cm /${content.name("XObject", image)} Do Q`,
  );
  return doc.save(layout, content);
}
