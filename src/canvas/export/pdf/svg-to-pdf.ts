import type { Rect } from "../../geometry.types";
import { embedImages } from "./pdf-image";
import { PdfDocument } from "./pdf-document";
import type { PdfExportOptions } from "./pdf-options.types";
import { pageMatrix, pdfPageLayout } from "./pdf-page-layout";
import { SvgPdfWriter } from "./svg-pdf-writer";

/**
 * A document from the SVG writer as a PDF page: shapes and text stay vectors. What PDF can't hold
 * the SVG writer has flattened already (its `pdf` target), so this reads only what it leaves.
 */
export async function svgToPdf(svg: string, rect: Rect, options: PdfExportOptions): Promise<Blob> {
  const root = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  if (root.tagName !== "svg") throw new Error("The drawing couldn't be read.");
  const layout = pdfPageLayout(rect, options);
  const doc = new PdfDocument();
  const images = await embedImages(doc, root, layout.scale, options);
  const writer = new SvgPdfWriter(doc, root, images, options);
  return doc.save(layout, writer.write(pageMatrix(layout, rect)));
}
