import type { CanvasGrid } from "../canvas-view.types";
import type { LayerPlacement } from "./layer-placement.types";

export interface RendererOptions {
  grid: CanvasGrid;
  /** Show the selection's size under it (see `CanvasViewOptions.sizeLabel`). */
  sizeLabel: boolean;
  /** Each element's drawing order and clip (the scene's; see `Scene.orderKey`, `Scene.clipOf`). */
  placement: LayerPlacement;
}
