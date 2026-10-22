import { unionRects, type Rect } from "@canvas";
import type { DesignNode } from "@design";

import type { Alignment } from "./align.types";

/** How far a node moves to align with `target` (the selection's bounds, or its parent frame). */
export function alignOffset(node: DesignNode, target: Rect, alignment: Alignment) {
  switch (alignment) {
    case "left":
      return { dx: target.x - node.x, dy: 0 };
    case "centerX":
      return { dx: Math.round(target.x + target.w / 2 - (node.x + node.w / 2)), dy: 0 };
    case "right":
      return { dx: target.x + target.w - (node.x + node.w), dy: 0 };
    case "top":
      return { dx: 0, dy: target.y - node.y };
    case "centerY":
      return { dx: 0, dy: Math.round(target.y + target.h / 2 - (node.y + node.h / 2)) };
    case "bottom":
      return { dx: 0, dy: target.y + target.h - (node.y + node.h) };
  }
}

/** What nodes align to: each other when there are several, otherwise the one node's parent. */
export function alignTarget(
  nodes: readonly DesignNode[],
  parentOf: (node: DesignNode) => Rect | null,
): Rect | null {
  if (nodes.length > 1) return unionRects(nodes.map(({ x, y, w, h }) => ({ x, y, w, h })));
  const node = nodes[0];
  return node ? parentOf(node) : null;
}
