/** A line of the table of contents, and a bookmark of the PDF: a section, or a page without them. */
export interface ContentsEntry {
  /** The section's name, or the page frame's. */
  title: string;
  /** How far down the sections it is (0 for the outermost, and for pages). */
  depth: number;
  /** Its first page's number as written ("4", "iv"; empty when that page isn't numbered). */
  label: string;
  /** The side it opens: its index in the layout's `sides`. */
  side: number;
}
