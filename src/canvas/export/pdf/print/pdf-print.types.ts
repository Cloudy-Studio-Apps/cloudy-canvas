import type { RenderingIntent } from "@shared/core";

/** The PDF/X a file is: X-4 keeps live transparency, X-1a has none, as its flat pages. */
export type PdfXStandard = "x4" | "x1a";

/** The press a file is converted for. */
export interface PdfPrintColor {
  /** The `.icc` file. */
  profile: Uint8Array;
  profileName: string;
  intent: RenderingIntent;
  standard: PdfXStandard;
  /** The document's title. */
  title: string;
}

/** What a PDF/X-4 file's XMP says. */
export interface PdfXmpFields {
  title: string;
  producer: string;
  date: Date;
  id: string;
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
