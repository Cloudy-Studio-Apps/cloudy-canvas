import { readParent, readPath, type CanvasElement } from "@canvas";

import { isDesignNode, withDescendants, type DesignNode } from "../core";
import { nodeColorPaths } from "./node-color-paths";
import type { SelectionColor } from "./selection-colors.types";

/**
 * The colors the selected nodes and everything inside them paint with, in the order they are
 * first met (layers in page order), each with every place it's used. Two uses are one color when
 * their hex and opacity (to the percent) are the same.
 */
export function collectSelectionColors(
  nodes: readonly DesignNode[],
  elements: readonly CanvasElement[],
): SelectionColor[] {
  const ids = withDescendants(new Set(nodes.map((node) => node.id)), elements);
  const byKey = new Map<string, SelectionColor>();
  for (const el of elements) {
    if (!ids.has(el.id) || !isDesignNode(el)) continue;
    for (const path of nodeColorPaths(el)) {
      const color = readPath(el, path);
      const opacity = readParent(el, path)?.opacity;
      if (typeof color !== "string" || typeof opacity !== "number") continue;
      const hex = color.toLowerCase();
      const key = `${hex}@${Math.round(opacity * 100)}`;
      const entry = byKey.get(key) ?? { key, color: hex, opacity, refs: [] };
      entry.refs.push({ nodeId: el.id, path });
      byKey.set(key, entry);
    }
  }
  return [...byKey.values()];
}
