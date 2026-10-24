import type { CanvasGrid } from "../canvas-view.types";
import type { LayerPlacement } from "./layer-placement.types";

export interface RendererOptions {
  grid: CanvasGrid;
  /** Show the selection's size under it (see `CanvasViewOptions.sizeLabel`). */
  sizeLabel: boolean;
  /** Each element's drawing order and clip (the scene's; see `Scene.orderKey`, `Scene.clipOf`). */
  placement: LayerPlacement;
  /** Whether some effect reads what's behind it, so the canvas keeps a back buffer. */
  backdrop: boolean;
}

export interface ChunkedSyncOptions {
  /** How many views exist so far, out of how many. */
  onProgress: (done: number, total: number) => void;
  /** Whether to stop (the engine is closing). */
  cancelled: () => boolean;
}

/** How `Renderer.captureView` draws. */
export interface CaptureOptions {
  /** Pixels per world unit. */
  scale: number;
  /** A 0xRRGGBB fill. */
  background: number;
}
