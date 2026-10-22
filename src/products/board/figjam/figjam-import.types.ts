import type { CanvasElement } from "@canvas";

/** A FigJam file converted to a board's content, before it goes into a document. */
export interface FigJamImport {
  /** The file's name in FigJam, when the file says. */
  name: string | null;
  /** Every element, bottom to top, in world coordinates. */
  elements: CanvasElement[];
  /** Image files by the asset ids the elements use. */
  assets: ReadonlyMap<string, Uint8Array>;
  /** What couldn't be brought over as it was, one line per kind of loss. */
  warnings: string[];
}

/** A board document made from a FigJam file, and what its import reported. */
export interface FigJamBoard<D> {
  doc: D;
  name: string | null;
  warnings: string[];
}
