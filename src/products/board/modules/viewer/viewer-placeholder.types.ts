import type { ImageElement } from "../image";

/** Where a stand-in goes: the box of the element it replaces. */
export interface PlaceholderSpot {
  id: string;
  index: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An element the viewer can't draw, replaced by a picture of the question-mark seal. */
export interface ViewerPlaceholder {
  element: ImageElement;
  assetId: string;
  /** The picture, an SVG file. */
  svg: string;
}
