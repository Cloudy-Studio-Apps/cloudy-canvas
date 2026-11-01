import type { PdfDocument } from "../pdf-document";

/** A gradient stop as `<stop>` gives it. */
export interface PdfGradientStop {
  offset: number;
  /** `#rrggbb`. */
  color: string;
}

/** A stop in the output's color space: its components, as PDF writes them. */
export interface PdfOutputStop {
  offset: number;
  color: string;
}

/** Pixels to embed, read from a canvas. */
export interface PdfPixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * The color space a PDF is written in, the only place that knows it: everything that puts a color
 * or a picture in a PDF asks this. `quality` is a JPEG's, 0–1.
 */
export interface PdfColorOutput {
  /** The name of the space, for shadings and transparency groups. */
  readonly space: string;
  /** The operators setting a `#rrggbb` color for fills, or strokes with `stroke`. */
  paint(hex: string, stroke: boolean): string;
  /** A gradient's stops: as many as it takes for its blend to look as it does on screen. */
  stops(stops: readonly PdfGradientStop[]): PdfOutputStop[];
  /** Embeds an opaque canvas, returning its object. */
  opaque(doc: PdfDocument, canvas: HTMLCanvasElement, quality: number): Promise<number>;
  /** Embeds pixels with their alpha as a soft mask, returning the object. */
  translucent(doc: PdfDocument, pixels: PdfPixels): Promise<number>;
}
