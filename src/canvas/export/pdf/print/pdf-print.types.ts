/** What a page going to press has round its trim, in world units. */
export interface PdfPrintBoxes {
  /** How far the content runs past the trim, to be cut off. */
  bleed: number;
  /** Crop marks, in a band outside the bleed. */
  marks: boolean;
}
