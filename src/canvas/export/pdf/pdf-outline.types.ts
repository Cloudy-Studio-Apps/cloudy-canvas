/** A bookmark of the PDF's outline (the reader's sidebar): its title, page and nested ones. */
export interface PdfOutlineItem {
  title: string;
  /** The page it opens: its 0-based index in the document. */
  page: number;
  children: readonly PdfOutlineItem[];
}
