import type { DesignNode, LayerTree } from "../core";
import type { LayerTreeNode } from "./layer-tree-of.types";

/** The layer tree as nested nodes, from a layer, named by `nameOf` (the layers panel's names). */
export function layerTreeOf(
  tree: LayerTree,
  nameOf: (node: DesignNode) => string,
): (node: DesignNode) => LayerTreeNode {
  const toNode = (node: DesignNode): LayerTreeNode => {
    const children = tree.get(node.id) ?? [];
    return {
      id: node.id,
      type: node.type,
      name: nameOf(node),
      ...(node.visible ? {} : { hidden: true as const }),
      ...(node.locked ? { locked: true as const } : {}),
      ...(node.isMask
        ? {
            mask: {
              type: node.maskType,
              ...(node.maskInverted ? { inverted: true as const } : {}),
            },
          }
        : {}),
      ...(children.length > 0 ? { children: children.map(toNode) } : {}),
    };
  };
  return toNode;
}
