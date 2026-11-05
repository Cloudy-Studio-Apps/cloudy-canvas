/** A page as the sections are placed over it (`pageStarts`). */
export interface PlacedPage {
  /** Its place in the expansion's pages (a kept page out of it: the one before it's). */
  order: number;
  /** Its slot's id (a pending page's made-up one). */
  slot: string;
  printed: boolean;
}
