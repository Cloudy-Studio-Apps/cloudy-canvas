import type { PdfExportOptions, PdfImageQuality } from "./pdf-options.types";

const POINTS_PER_INCH = 72;

export const DEFAULT_PDF_OPTIONS: PdfExportOptions = {
  mode: "sharp",
  text: "selectable",
  imageQuality: "high",
  dpi: 300,
  pointsPerUnit: 0.75,
  page: "fit",
  orientation: "auto",
  pages: "single",
  margin: 0,
  print: null,
  language: null,
};

/** JPEG quality of each choice. */
export const PDF_JPEG_QUALITY: Readonly<Record<PdfImageQuality, number>> = {
  high: 0.95,
  balanced: 0.82,
  small: 0.6,
};

/** Pixels per world unit at `dpi`. */
export function pdfImageScale({
  dpi,
  pointsPerUnit,
}: Pick<PdfExportOptions, "dpi" | "pointsPerUnit">): number {
  return (dpi * pointsPerUnit) / POINTS_PER_INCH;
}
