import { movedBindings, pickedBindings } from "@canvas";

import type { DesignNode } from "../node/design-node.types";

/** The variables a layer's fills or strokes use, as a paint style's (`paints.N…`). */
export function paintBindingsOf(
  node: DesignNode,
  field: "fills" | "strokes",
): Record<string, string> {
  return movedBindings(node.bindings, field, "paints");
}

/** The variables a layer's effects use, as an effect style's. */
export function effectBindingsOf(node: DesignNode): Record<string, string> {
  return movedBindings(node.bindings, "effects", "effects");
}

/** The variables a layer's stroke weights use, as a stroke style's. */
export function strokeBindingsOf(node: DesignNode): Record<string, string> {
  return pickedBindings(node.bindings, ["strokeWeight", "strokeWeights"]);
}
