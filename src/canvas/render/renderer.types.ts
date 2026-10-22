import type { CanvasGrid } from "../canvas-view.types";
import type { OrderKeyOf } from "./order-key.types";

export interface RendererOptions {
  grid: CanvasGrid;
  /** Each element's drawing order (the scene's; see `Scene.orderKey`). */
  orderOf: OrderKeyOf;
}
