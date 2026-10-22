import type { CanvasElement } from "@canvas";

import type { DesignNode } from "./design-node.types";

/** Whether an element is a design node (has a place in the layer tree). */
export function isDesignNode(el: CanvasElement): el is DesignNode {
  return "parentId" in el && "name" in el;
}
