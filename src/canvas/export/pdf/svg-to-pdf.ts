import type { Rect } from "../../geometry.types";
import type { PdfColorOutput } from "./color";
import { embedImages } from "./pdf-image";
import type { PdfDocument } from "./pdf-document";
import type { PdfExportOptions } from "./pdf-options.types";
import { pageMatrix, pdfPageLayout } from "./pdf-page-layout";
import { bleedClipOps, cropMarkOps } from "./print/print-layout";
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
  output: PdfColorOutput,
): Promise<void> {
  const root = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  if (root.tagName !== "svg") throw new Error("The drawing couldn't be read.");
  const layout = pdfPageLayout(rect, options);
  const images = await embedImages(doc, root, layout.scale, options, output);
  const writer = new SvgPdfWriter(doc, root, images, options, output);
  const content = writer.write(pageMatrix(layout, rect), bleedClipOps(layout));
  if (options.print?.marks) content.ops.push(cropMarkOps(layout, output.registration));
  doc.addPage(layout, content);
}
