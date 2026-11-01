/** `sharp` keeps shapes and text as vectors; `flattened` saves the page as one picture. */
export type PdfMode = "sharp" | "flattened";
/** `selectable` adds a hidden text layer over the outlines, so text can be searched and copied. */
export type PdfText = "selectable" | "outlines";
export type PdfImageQuality = "high" | "balanced" | "small";
export type PdfDpi = 300 | 150 | 96;
/** `fit` sizes the page to the content; the others are paper sizes. */
export type PdfPageSize = "fit" | "a4" | "letter" | "a3";
export type PdfOrientation = "auto" | "portrait" | "landscape";

export interface PdfExportOptions {
  mode: PdfMode;
  text: PdfText;
  imageQuality: PdfImageQuality;
  /** Pixels per inch of pictures, and of the whole page when flattened. */
  dpi: PdfDpi;
  page: PdfPageSize;
  orientation: PdfOrientation;
  /** Millimeters round the content on a paper size. */
  margin: number;
}
