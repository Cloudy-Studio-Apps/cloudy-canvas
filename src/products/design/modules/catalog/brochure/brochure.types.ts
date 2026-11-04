import type { CanvasElement, ElementDefaults, PdfMode } from "@canvas";
import type { RenderingIntent } from "@shared/core";

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
  /**
   * The master its frames show (a `BrochureMaster` id): left out, the brochure's default
   * (`settings.defaultMaster`); `null`, none (a full-bleed photo).
   */
  master?: string | null;
  /** The master layers detached on this page (their ids on the master): they're no longer stamped. */
  skip?: string[];
}

/**
 * A brochure's master: a header and footer designed once, on a frame for left pages and one for
 * right pages (frames of its design page, the page's size, never printed themselves). Its
 * layers are stamped onto every page that uses it, as locked copies (`syncPageItems`).
 */
export interface BrochureMaster {
  id: string;
  name: string;
  /** The frame for left pages, `null` when it's gone (then left pages get none). */
  left: string | null;
  /** The frame for right pages (and every page of the single layout), `null` when it's gone. */
  right: string | null;
}

/** How page numbers are written. */
export type PageNumberStyle = "arabic" | "roman-lower" | "roman-upper";

/**
 * How covers are numbered: `numbered`, like any page; `hidden`, counted but not written (the
 * usual in print); `uncounted`, neither (the first page inside is 1).
 */
export type CoverNumbering = "numbered" | "hidden" | "uncounted";

export interface BrochureNumbering {
  /** The first page's number. */
  start: number;
  style: PageNumberStyle;
  covers: CoverNumbering;
}

/**
 * A part of the brochure (a chapter: "Lima", "Cusco"), from the page `start` to the next
 * section: its name is the `{section}` of its pages' headers and a line of the contents, and its
 * numbering can restart.
 */
export interface BrochureSection {
  id: string;
  name: string;
  /** The slot it starts at. */
  start: string;
  /**
   * How deep it is: left out (0) a top-level section, 1 a subsection of the one before it, and so
   * on (read no deeper than one under the section before, `placeSections`).
   */
  level?: number;
  /** Its first page's number, when numbering restarts there. */
  restart?: number;
  /** How its pages' numbers are written, when it changes there. */
  style?: PageNumberStyle;
}

/**
 * How the brochure is read: `book`, pages facing each other in spreads across a spine; `single`,
 * one page at a time.
 */
export type BrochureLayout = "book" | "single";

/** Which covers a book has: pages that stand alone, the front on the right, the back on the left. */
export type BrochureCovers = "both" | "front" | "back" | "none";

/**
 * How the brochure's frames are laid out on the canvas: `off` leaves them where they are; `below`,
 * the printed pages in one row left to right (grouped by spread) with each page's other options
 * stacked under it; `beside`, a spread per row top to bottom with the options out to the side (a
 * left page's to the left, the others' to the right).
 */
export type BrochureArrange = "off" | "below" | "beside";

export type BrochureColorMode = "rgb" | "cmyk";

/** A print profile stored with the file. */
export interface BrochurePrintProfile {
  /** The document asset holding the `.icc` file. */
  assetId: string;
  name: string;
}

/** How the brochure prints. */
export interface BrochureSettings {
  layout: BrochureLayout;
  /** The book layout's covers (the single layout has none). */
  covers: BrochureCovers;
  /** Spread frames (two pages in one frame) print as two PDF pages, else as one wide page. */
  splitSpreads: boolean;
  /** The safe area's inset from each page edge, in millimetres (what the checks read). */
  margin: number;
  /** How far pages run past their trim in the PDF, in millimetres. */
  bleed: number;
  /** Crop marks round each page of the PDF. */
  cropMarks: boolean;
  /** `cmyk` converts everything through `printProfile`, for a press. */
  colorMode: BrochureColorMode;
  /** The press's profile, kept in the file; `null` until one's loaded. */
  printProfile: BrochurePrintProfile | null;
  renderingIntent: RenderingIntent;
  /** Pixels per inch of the exported PDF's pictures, and of whole pages when `flattened`. */
  dpi: number;
  /** `sharp` keeps shapes and text as vectors; `flattened` prints each page as one picture. */
  pdfMode: PdfMode;
  /**
   * How its frames are laid out on the canvas, kept up after every edit of the brochure while
   * not `off` (other layers in the way are moved up or down).
   */
  arrange: BrochureArrange;
  /** How its pages are numbered. */
  numbering: BrochureNumbering;
  /** The master pages show unless they pick another or none; `null` for none. */
  defaultMaster: string | null;
  /** Whether covers show their master too (they don't by default). */
  mastersOnCovers: boolean;
  /**
   * The language it's written in (a BCP 47 tag, `BROCHURE_LANGUAGES`): its dates, the words of
   * its page items and master frames, and its PDF's language; `null` (files from before), the
   * app's.
   */
  language: string | null;
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
  /** Its masters (`fillDefaults` gives older records none). */
  masters: BrochureMaster[];
  /** Its sections, in no particular order (each starts at a slot, one per level there). */
  sections: BrochureSection[];
  settings: BrochureSettings;
}

export interface BrochureDefaults extends ElementDefaults {
  /** What a new brochure is called (numbered: "Brochure 2"). */
  name: string;
  settings: BrochureSettings;
}
