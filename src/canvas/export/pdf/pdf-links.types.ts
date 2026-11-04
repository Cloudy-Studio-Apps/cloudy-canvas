import type { PdfBox } from "./pdf-writer.types";

/** A clickable area of a page, in its points, opening another page of the document. */
export interface PdfLink {
  box: PdfBox;
  /** The page it opens: its 0-based index in the document. */
  page: number;
}
