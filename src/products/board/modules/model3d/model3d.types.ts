import type { CanvasElement, ModelData } from "@canvas";

/** A 3D model on the board: a box that shows the saved picture of the model (see `ModelData`). */
export interface ModelElement extends CanvasElement, ModelData {
  type: "model3d";
}
