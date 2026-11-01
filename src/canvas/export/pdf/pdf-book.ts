import type { Size } from "../../geometry.types";
import type { ExportHost } from "../export.types";
import { RGB_OUTPUT } from "./color";
import { addPdfPage } from "./export-pdf";
import { PdfContent, PdfDocument } from "./pdf-document";
import { DEFAULT_PDF_OPTIONS } from "./pdf-options";
import type { PdfExportOptions } from "./pdf-options.types";
import { pdfPageLayout } from "./pdf-page-layout";
import type { PdfBookOptions, PdfBookPage } from "./pdf-book.types";

/**
 * A PDF built a page at a time, each sized to the area it shows: the Catalog's brochures and the
 * Design system, which draw one frame after another, on any page, and report as they go.
 */
export class PdfBook {
  private readonly doc = new PdfDocument();
  private readonly host: () => ExportHost;
  private readonly options: PdfExportOptions;

  constructor({ host, ...options }: PdfBookOptions) {
    this.host = host;
    this.options = { ...DEFAULT_PDF_OPTIONS, ...options };
  }

  async add({ ids, rect }: PdfBookPage): Promise<void> {
    const host = this.host();
    const elements = host.elementsOf("board", ids).map((el) => host.forExport(el));
    if (elements.length === 0) throw new Error("There's nothing to export on this page.");
    await addPdfPage(this.doc, host, { elements, rect }, "solid", this.options, RGB_OUTPUT);
  }

  /** An empty page. */
  addBlank({ w, h }: Size): void {
    const layout = pdfPageLayout({ x: 0, y: 0, w, h }, this.options);
    this.doc.addPage(layout, new PdfContent());
  }

  save(): Blob {
    return this.doc.save();
  }
}
