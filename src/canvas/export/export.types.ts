import type { CanvasElement } from "../elements";
import type { Rect } from "../geometry.types";
import type { CanvasLinks } from "../links";
import type { SnapshotOptions, VectorSnapshotOptions } from "../render";

export type ExportFormat = "png" | "jpg" | "pdf" | "csv" | "svg";

/** How an SVG holds text: as glyph outlines (looks the same anywhere) or as live, editable text. */
export type SvgText = "outlines" | "live";

/** `solid` fills with the canvas background; PNG and SVG can leave it out, JPG and PDF can't. */
export type ExportBackground = "solid" | "transparent";

/** The selection (with what moves with it) or every element on the canvas. */
export type ExportArea = "selection" | "board";

export interface ExportOptions {
  format: ExportFormat;
  background: ExportBackground;
  area: ExportArea;
  /** Elements to export (with what moves with them) instead of the area's. */
  ids?: readonly string[];
  /** Pixels per world unit for images (2 by default). */
  scale?: number;
  /** The image's longest side, in pixels, at most (lowers `scale`; 8192 by default). */
  maxSide?: number;
  /** Exactly this world area, with no padding (e.g. a page frame), instead of the elements'. */
  rect?: Rect;
  /** How an SVG holds text (outlines by default). */
  svgText?: SvgText;
}

/** What `exportElements` needs from the engine. */
export interface ExportHost {
  /**
   * The elements of an area, or of `ids` with what moves with them, bottom to top (derived
   * geometry resolved).
   */
  elementsOf(area: ExportArea, ids?: readonly string[]): CanvasElement[];
  bounds(el: CanvasElement): Rect;
  /** The element's grid of texts for CSV, or `null` (see `ElementKind.rows`). */
  rows(el: CanvasElement): string[][] | null;
  /** Fresh links for an export (the product's `createLinks`). */
  createLinks(): CanvasLinks[];
  background: number;
  snapshot(
    elements: readonly CanvasElement[],
    options: SnapshotOptions,
  ): Promise<HTMLCanvasElement>;
  /** The elements as an SVG document, written from the same off-screen tree as `snapshot`. */
  vector(
    elements: readonly CanvasElement[],
    options: Omit<VectorSnapshotOptions, "glyphs">,
  ): Promise<string>;
}
