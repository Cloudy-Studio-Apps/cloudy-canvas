import type { LayerTree } from "@canvas";

import { isDesignNode } from "../node";

/**
 * The design's layer tree for Enter (select children) and Shift+Enter (select parent): a node's
 * parent is its `parentId`, its children the nodes that name it.
 */
export const designLayerTree: LayerTree = {
  parentOf: (el) => (isDesignNode(el) ? el.parentId : null),
  childrenOf: (id, elements) =>
    elements.filter((el) => isDesignNode(el) && el.parentId === id).map((el) => el.id),
};
