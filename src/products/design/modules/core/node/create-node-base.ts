import { createElementBase, type Rect } from "@canvas";

import type { NodeBaseOptions } from "./create-node-base.types";
import type { DesignNode } from "./design-node.types";
import { NODE_DEFAULTS } from "./node.defaults";

/**
 * The fields every new design node starts with: the element base (id, type, index, bounds) plus
 * its name, parent and look. Factories spread their own fields on top.
 */
export function createNodeBase<K extends string>(
  type: K,
  rect: Rect,
  index: string,
  { name, parentId = null, fills = [] }: NodeBaseOptions,
): DesignNode & { type: K } {
  return {
    ...createElementBase(type, rect, index),
    name,
    parentId,
    // Set when it's added: the page on screen (see `DesignNode.pageId`).
    pageId: "",
    visible: true,
    opacity: NODE_DEFAULTS.opacity,
    fills,
    strokes: [],
    strokeWeight: NODE_DEFAULTS.strokeWeight,
    strokeAlign: NODE_DEFAULTS.strokeAlign,
    strokeCap: NODE_DEFAULTS.strokeCap,
    strokeJoin: NODE_DEFAULTS.strokeJoin,
    strokeMiterAngle: NODE_DEFAULTS.strokeMiterAngle,
    strokeDashes: [],
    strokeWeights: null,
    isMask: false,
    maskType: NODE_DEFAULTS.maskType,
    maskInverted: false,
    effects: [],
  };
}
