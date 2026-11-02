import type { Camera } from "../camera";

export interface TouchNavigationHost {
  readonly canvas: HTMLCanvasElement;
  readonly camera: Camera;
  /** The fingers moved the camera. */
  onChange(): void;
}
