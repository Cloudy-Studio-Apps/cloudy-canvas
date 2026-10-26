import type { CanvasElement, TokenRecord } from "@canvas";

/** A Figma file converted to a design's content, before it goes into a document. */
export interface FigmaImport {
  /** The file's name in Figma, when the file says. */
  name: string | null;
  /** Pages first, then every layer with its `pageId` and `parentId` set. */
  elements: CanvasElement[];
  /**
   * The file's variable collections (with Figma's modes, which the variables module's migration
   * turns into axes), variables and styles.
   */
  tokens: TokenRecord[];
  /** Image files by the asset ids the elements' image paints use. */
  assets: ReadonlyMap<string, Uint8Array>;
  /** What couldn't be brought over as it was, one line per kind of loss. */
  warnings: string[];
}

/** A design document made from a Figma file, and what its import reported. */
export interface FigmaDesign<D> {
  doc: D;
  name: string | null;
  warnings: string[];
}
