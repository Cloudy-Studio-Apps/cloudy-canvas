import type { RenderingIntent } from "@shared/core";

/** The press a file is converted for. */
export interface PdfPrintColor {
  /** The `.icc` file. */
  profile: Uint8Array;
  intent: RenderingIntent;
}

/** What a page going to press has round its trim, in world units. */
export interface PdfPrintBoxes {
  /** How far the content runs past the trim, to be cut off. */
  bleed: number;
  /** Crop marks, in a band outside the bleed. */
  marks: boolean;
  /** Converts everything to the press's CMYK; `null` stays RGB. */
  color: PdfPrintColor | null;
}
