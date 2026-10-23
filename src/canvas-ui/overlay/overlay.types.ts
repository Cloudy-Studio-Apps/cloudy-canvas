import type { Point } from "@canvas";

/** How the canvas maps world points to an overlay's: `screen = origin + world × zoom`. */
export interface ViewMapping {
  origin: Point;
  zoom: number;
}

/** Where an element's box lies: its corner, size and turn (degrees counterclockwise). */
export interface OverlayFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}
