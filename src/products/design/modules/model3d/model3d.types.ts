import type { ModelData } from "@canvas";

import type { DesignNode } from "../core";

/**
 * A 3D model on a design: a layer that shows the saved picture of the model (see `ModelData`),
 * with the usual layer fields (name, place in the tree, opacity, …) but no fills or strokes.
 */
export interface ModelNodeElement extends DesignNode, ModelData {
  type: "model3d";
}
