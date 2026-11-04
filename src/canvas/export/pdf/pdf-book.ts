import type { ColorConverter } from "@shared/core";

import type { Size } from "../../geometry.types";
import type { ExportHost } from "../export.types";
import { cmykOutput, RGB_OUTPUT, type PdfColorOutput } from "./color";
import { addPdfPage } from "./export-pdf";
import { PdfContent, PdfDocument } from "./pdf-document";
import { DEFAULT_PDF_OPTIONS } from "./pdf-options";
import type { PdfExportOptions } from "./pdf-options.types";
import { pdfPageLayout } from "./pdf-page-layout";
import type { PdfBookOptions, PdfBookPage } from "./pdf-book.types";
import { markPdfX } from "./print/pdf-x";
import { cropMarkOps } from "./print/print-layout";

/**
 * A PDF built a page at a time, each sized to the area it shows: the Catalog's brochures and the
 * Design system, which draw one frame after another, on any page, and report as they go.
 */
export class PdfBook {
  private readonly doc = new PdfDocument();
  private readonly host: () => ExportHost;
  private readonly options: PdfExportOptions;
  private output: PdfColorOutput | null = null;
  private converter: ColorConverter | null = null;

  constructor({ host, ...options }: PdfBookOptions) {
    this.host = host;
    this.options = { ...DEFAULT_PDF_OPTIONS, ...options };
    this.doc.setLanguage(this.options.language);
    const color = this.options.print?.color;
    if (color) markPdfX(this.doc, color);
  }

  async add({ ids, rect, prepare }: PdfBookPage): Promise<void> {
    const output = await this.colorOutput();
    const host = this.host();
    const elements = host.elementsOf("board", ids).map((el) => {
      const shown = host.forExport(el);
      return prepare ? prepare(shown) : shown;
    });
    if (elements.length === 0) throw new Error("There's nothing to export on this page.");
    const clips = prepare ? host.clipsOf(elements) : undefined;
    await addPdfPage(
      this.doc,
      host,
      { elements, rect, clips },
      // Paper shows where nothing's drawn: the canvas's color isn't to be printed.
      this.options.print ? "transparent" : "solid",
      this.options,
      output,
    );
  }

  /** An empty page. */
  async addBlank({ w, h }: Size): Promise<void> {
    const output = await this.colorOutput();
    const layout = pdfPageLayout({ x: 0, y: 0, w, h }, this.options);
    const content = new PdfContent();
    if (this.options.print?.marks) content.ops.push(cropMarkOps(layout, output.registration));
    this.doc.addPage(layout, content);
  }

  save(): Blob {
    return this.doc.save();
  }

  /** Frees what it holds; call it when done, whether or not the book was saved. */
  close(): void {
    this.converter?.close();
    this.converter = null;
  }

  private async colorOutput(): Promise<PdfColorOutput> {
    if (this.output) return this.output;
    const color = this.options.print?.color;
    if (!color) return (this.output = RGB_OUTPUT);
    const conversion = this.host().color;
    if (!conversion) throw new Error("Color management isn't available here.");
    this.converter = await conversion.converter(color.profile, color.intent);
    return (this.output = cmykOutput(this.converter));
  }
}
