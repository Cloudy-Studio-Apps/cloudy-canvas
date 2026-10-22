import { Graphics } from "pixi.js";

import type { Camera } from "../../camera";
import { mod } from "../../utils";
import type { GridLayer } from "./grid-layer.types";

const GRID_SPACING = 24; // world units
const MIN_SCREEN_SPACING = 14; // px; the grid doubles its spacing below this

/** Screen-space dot grid that follows the camera. */
export class DotGridLayer extends Graphics implements GridLayer {
  draw(camera: Camera, color: number): void {
    const { w, h } = camera.viewport;
    let spacing = GRID_SPACING * camera.zoom;
    while (spacing < MIN_SCREEN_SPACING) spacing *= 2;
    const offsetX = mod(camera.x * camera.zoom, spacing);
    const offsetY = mod(camera.y * camera.zoom, spacing);
    const radius = camera.zoom < 0.5 ? 0.8 : 1;

    this.clear();
    for (let x = offsetX; x < w; x += spacing) {
      for (let y = offsetY; y < h; y += spacing) this.circle(x, y, radius);
    }
    this.fill({ color });
  }
}
