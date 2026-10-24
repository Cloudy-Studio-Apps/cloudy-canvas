/** One page of a PDF: a JPEG image filling it. */
export interface PdfPage {
  jpeg: Uint8Array;
  /** The image's size in pixels. */
  pixels: { width: number; height: number };
  /** The page's size in world units (see `PdfOptions.pointsPerUnit`). */
  size: { width: number; height: number };
}

export interface PdfOptions {
  /**
   * PDF points per world unit: 0.75 (the default) reads units as CSS pixels; 1 reads them as
   * points, as paper-sized frames are (A4 is 595 × 842).
   */
  pointsPerUnit?: number;
}
