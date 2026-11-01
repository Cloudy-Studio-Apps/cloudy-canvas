import type { CanvasElement } from "@canvas";

import { isDesignNode, withDescendants, type DesignNode } from "../../core";

/** The visible layers inside a frame (a hidden one hides what it holds). */
export function shownNodes(frameId: string, elements: readonly CanvasElement[]): DesignNode[] {
  const nodes = elements.filter(isDesignNode);
  const hidden = withDescendants(
    new Set(nodes.filter((node) => !node.visible).map((node) => node.id)),
    nodes,
  );
  const inside = withDescendants(new Set([frameId]), nodes);
  return nodes.filter((node) => node.id !== frameId && inside.has(node.id) && !hidden.has(node.id));
}
