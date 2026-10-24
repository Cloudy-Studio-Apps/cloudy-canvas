import type { CanvasElement, ElementDefaults } from "@canvas";

/**
 * One page of a brochure: the frames that could be it (its options, e.g. "Opción A/B/C") and the
 * one printed. Frames are named by id, so renaming them changes nothing.
 */
export interface BrochureSlot {
  id: string;
  /** Top-level frames, in the order the options are listed. */
  frames: string[];
  /** The option printed; one of `frames`. */
  chosen: string;
}

/**
 * How the brochure is read: `book`, pages facing each other in spreads across a spine; `single`,
 * one page at a time.
 */
export type BrochureLayout = "book" | "single";

/** Which covers a book has: pages that stand alone, the front on the right, the back on the left. */
export type BrochureCovers = "both" | "front" | "back" | "none";

/** How the brochure prints. */
export interface BrochureSettings {
  layout: BrochureLayout;
  /** The book layout's covers (the single layout has none). */
  covers: BrochureCovers;
  /** Spread frames (two pages in one frame) print as two PDF pages, else as one wide page. */
  splitSpreads: boolean;
  /** The safe area's inset from each page edge, in millimetres (what the checks read). */
  margin: number;
  /** Pixels per inch of the exported PDF's pages. */
  dpi: number;
}

/**
 * A brochure (the Catalog mode's): a record in the document, never drawn or hit, holding its pages
 * in order and how it prints. It belongs to one design page and uses only that page's frames; a
 * page can hold several.
 */
export interface BrochureElement extends CanvasElement {
  type: "brochure";
  name: string;
  /** The design page it belongs to (named `page`, not `pageId`, so it's never taken for a node). */
  page: string;
  /**
   * When it was last opened (ms): the page's open brochure is the one opened last (else its
   * first). View state, written outside the undo history.
   */
  openedAt?: number;
  slots: BrochureSlot[];
  settings: BrochureSettings;
}

export interface BrochureDefaults extends ElementDefaults {
  /** What a new brochure is called (numbered: "Brochure 2"). */
  name: string;
  settings: BrochureSettings;
}
