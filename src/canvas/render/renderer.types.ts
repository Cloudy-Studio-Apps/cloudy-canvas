import type { CanvasGrid } from "../canvas-view.types";
import type { LayerPlacement } from "./layer-placement.types";

export interface RendererOptions {
  grid: CanvasGrid;
  /** Each element's drawing order and clip (the scene's; see `Scene.orderKey`, `Scene.clipOf`). */
  placement: LayerPlacement;
}
