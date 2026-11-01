import type { CanvasElement } from "../../elements";
import type { Rect } from "../../geometry.types";

/** One page to write: its elements and the world area it shows. */
export interface PdfPageSource {
  elements: readonly CanvasElement[];
  rect: Rect;
}

/** An affine map, as PDF and SVG write it: `a b c d e f`. */
export type PdfMatrix = readonly [number, number, number, number, number, number];

/** Where the content goes on the page, in points. */
export interface PdfPageLayout {
  width: number;
  height: number;
  /** Points per world unit. */
  scale: number;
  /** The content's left edge, and its top measured from the page's bottom. */
  left: number;
  top: number;
}

/** The named things a content stream uses. */
export type PdfResourceKind = "ExtGState" | "Pattern" | "XObject" | "Font";

/** Where a stream's content sits: its map to the stream's space, and to the page. */
export interface PdfFrame {
  local: PdfMatrix;
  page: PdfMatrix;
}
