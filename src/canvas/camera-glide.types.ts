import type { Point } from "./geometry.types";

/** Where the camera is: the world point at the middle of the view, and the zoom. */
export interface CameraView {
  center: Point;
  zoom: number;
}
