import type { Graphics } from "pixi.js";

import type { Camera } from "../../camera";

/** The screen-space background that follows the camera (see `CanvasGrid`). */
export interface GridLayer extends Graphics {
  draw(camera: Camera, color: number): void;
}
