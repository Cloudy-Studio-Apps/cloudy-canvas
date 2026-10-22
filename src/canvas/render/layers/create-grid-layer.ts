import { Graphics } from "pixi.js";

import type { CanvasGrid } from "../../canvas-view.types";
import { DotGridLayer } from "./dot-grid-layer";
import type { GridLayer } from "./grid-layer.types";
import { PixelGridLayer } from "./pixel-grid-layer";

/** Draws nothing (`grid: "none"`). */
class EmptyGridLayer extends Graphics implements GridLayer {
  draw(): void {}
}

/** The background layer for a product's `CanvasGrid`. */
export function createGridLayer(grid: CanvasGrid): GridLayer {
  if (grid === "pixels") return new PixelGridLayer();
  if (grid === "none") return new EmptyGridLayer();
  return new DotGridLayer();
}
