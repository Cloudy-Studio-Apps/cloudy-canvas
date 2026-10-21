import type { CanvasElement } from "../elements";
import type { Rect } from "../geometry.types";
import type { CanvasLinks } from "../links";
import type { SnapshotOptions } from "../render";

export type ExportFormat = "png" | "jpg" | "pdf" | "csv";

/** `solid` fills with the canvas background; JPG and PDF are always solid. */
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
}
