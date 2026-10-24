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

/** How the brochure prints. */
export interface BrochureSettings {
  /** Pages face each other in spreads (the first one alone, as a cover). */
  facing: boolean;
  /** The safe area's inset from each page edge, in millimetres (what the checks read). */
  margin: number;
  /** Pixels per inch of the exported PDF's pages. */
  dpi: number;
}

/**
 * A design's brochure (the Catalog mode's): a record in the document, never drawn or hit, holding
 * its pages in order and how it prints. A design has at most one.
 */
export interface BrochureElement extends CanvasElement {
  type: "brochure";
  slots: BrochureSlot[];
  settings: BrochureSettings;
}

export interface BrochureDefaults extends ElementDefaults {
  settings: BrochureSettings;
}
