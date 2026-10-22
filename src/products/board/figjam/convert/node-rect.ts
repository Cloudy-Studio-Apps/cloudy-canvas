import { roundRect, type Rect } from "@canvas";
import { boxOf, isAxisAligned, type FigNode } from "@canvas/figma";

import type { FigJamPlacement } from "./convert-figjam-node.types";

/**
 * The world box of a node. Board elements don't rotate, so a rotated node becomes the upright box
 * around it (counted in the warnings).
 */
export function nodeRect(node: FigNode, { world, ctx }: FigJamPlacement): Rect {
  if (!isAxisAligned(world)) ctx.warnings.add("rotated items were straightened");
  const size = node.size ?? { x: 0, y: 0 };
  return roundRect(boxOf(world, size.x, size.y));
}
