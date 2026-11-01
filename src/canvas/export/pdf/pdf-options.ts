import type { PdfExportOptions, PdfImageQuality } from "./pdf-options.types";

export const DEFAULT_PDF_OPTIONS: PdfExportOptions = {
  mode: "sharp",
  text: "selectable",
  imageQuality: "high",
  dpi: 300,
  page: "fit",
  orientation: "auto",
  margin: 0,
};

/** JPEG quality of each choice. */
export const PDF_JPEG_QUALITY: Readonly<Record<PdfImageQuality, number>> = {
  high: 0.95,
  balanced: 0.82,
  small: 0.6,
};

/** The pixels of a CSS pixel, which is what world units are, at `dpi`. */
export function pdfImageScale(dpi: number): number {
  return dpi / 96;
}
