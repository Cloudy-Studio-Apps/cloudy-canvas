/** What's drawn behind the elements: dots, a pixel grid when zoomed in, or nothing. */
export type CanvasGrid = "dots" | "pixels" | "none";

/** How a product's canvas is viewed: its zoom range, its background grid and its selection chrome. */
export interface CanvasViewOptions {
  /** Smallest zoom (e.g. 0.1 = 10%). */
  minZoom: number;
  /** Largest zoom (e.g. 8 = 800%). */
  maxZoom: number;
  grid: CanvasGrid;
  /** Show the selection's width × height in a tag under it (the design's). */
  sizeLabel: boolean;
}
