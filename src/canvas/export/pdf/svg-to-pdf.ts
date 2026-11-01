import type { Rect } from "../../geometry.types";
import { embedImages } from "./pdf-image";
import type { PdfDocument } from "./pdf-document";
import type { PdfExportOptions } from "./pdf-options.types";
import { pageMatrix, pdfPageLayout } from "./pdf-page-layout";
import { SvgPdfWriter } from "./svg-pdf-writer";

/**
 * Adds a document from the SVG writer to `doc` as a page: shapes and text stay vectors. What PDF
 * can't hold the SVG writer has flattened already (its `pdf` target), so this reads only what it
 * leaves.
 */
export async function addSvgPage(
  doc: PdfDocument,
  svg: string,
  rect: Rect,
  options: PdfExportOptions,
): Promise<void> {
  const root = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  if (root.tagName !== "svg") throw new Error("The drawing couldn't be read.");
  const layout = pdfPageLayout(rect, options);
  const images = await embedImages(doc, root, layout.scale, options);
  const writer = new SvgPdfWriter(doc, root, images, options);
  doc.addPage(layout, writer.write(pageMatrix(layout, rect)));
}
