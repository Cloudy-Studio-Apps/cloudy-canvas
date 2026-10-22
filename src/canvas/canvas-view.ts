import { MAX_ZOOM, MIN_ZOOM } from "./camera";
import type { CanvasViewOptions } from "./canvas-view.types";

/** The view a product gets when it doesn't set one (the board's). */
export const DEFAULT_VIEW_OPTIONS: CanvasViewOptions = {
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  grid: "dots",
  sizeLabel: false,
  snapping: { objects: false, pixelGrid: false, guides: false },
  rulers: false,
};
