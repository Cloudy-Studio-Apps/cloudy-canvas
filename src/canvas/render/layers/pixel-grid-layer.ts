import { Graphics } from "pixi.js";

import type { Camera } from "../../camera";
import { mod } from "../../utils";
import type { GridLayer } from "./grid-layer.types";

/** Zoom from which each world unit (a pixel of the design) gets its own cell. */
const MIN_PIXEL_ZOOM = 8;
const LINE_ALPHA = 0.6;

/** Screen-space grid of one-world-unit cells, shown only when zoomed in far enough. */
export class PixelGridLayer extends Graphics implements GridLayer {
  draw(camera: Camera, color: number): void {
    this.clear();
    if (camera.zoom < MIN_PIXEL_ZOOM) return;
    const { w, h } = camera.viewport;
    const spacing = camera.zoom;
    const offsetX = mod(camera.x * camera.zoom, spacing);
    const offsetY = mod(camera.y * camera.zoom, spacing);
    // Lines sit on pixel centers so they stay one device pixel wide.
    for (let x = offsetX; x < w; x += spacing)
      this.moveTo(Math.round(x) + 0.5, 0).lineTo(Math.round(x) + 0.5, h);
    for (let y = offsetY; y < h; y += spacing)
      this.moveTo(0, Math.round(y) + 0.5).lineTo(w, Math.round(y) + 0.5);
    this.stroke({ color, width: 1, alpha: LINE_ALPHA });
  }
}
