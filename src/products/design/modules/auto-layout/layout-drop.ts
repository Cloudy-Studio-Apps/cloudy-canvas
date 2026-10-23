import { generateNKeysBetween } from "fractional-indexing";

import {
  elementBounds,
  rectCenter,
  type CanvasDocument,
  type ElementKinds,
  type ElementPatch,
  type Point,
} from "@canvas";

import { layoutOf, type AutoLayout, type DesignNode } from "../core";
import { DocumentTree } from "./document-tree";
import { toFrameSpace } from "./frame-space";

/**
 * After a drag (`onMoved`, once the moved layers have their new parents): each moved layer in an
 * auto layout frame takes the place its center was dropped at among the layers that didn't move,
 * so dragging reorders, as in Figma. The layout then puts it there (the `afterEdit` hook).
 */
export function reorderDropped(
  doc: CanvasDocument,
  moved: ReadonlySet<string>,
  kinds: ElementKinds,
): void {
  const tree = new DocumentTree(doc);
  // The dropped layers by the place they go in: frame id and how many layers come before.
  const slots = new Map<string, { frame: DesignNode; before: number; nodes: DesignNode[] }>();
  for (const id of moved) {
    const node = tree.get(id);
    const frame = node?.parentId ? tree.get(node.parentId) : undefined;
    const layout = layoutOf(frame);
    if (!node || !frame || !layout || node.layoutAbsolute || moved.has(frame.id)) continue;
    const stay = tree
      .children(frame.id)
      .filter((child) => !moved.has(child.id) && child.visible && !child.layoutAbsolute);
    const at = localCenter(node, frame, kinds);
    const before = stay.filter((child) =>
      comesBefore(localCenter(child, frame, kinds), at, layout),
    );
    const key = `${frame.id}:${before.length}`;
    const slot = slots.get(key) ?? { frame, before: before.length, nodes: [] };
    slot.nodes.push(node);
    slots.set(key, slot);
  }

  const patches = new Map<string, ElementPatch>();
  for (const { frame, before, nodes } of slots.values()) {
    const layout = layoutOf(frame)!;
    const stay = tree
      .children(frame.id)
      .filter((child) => !moved.has(child.id) && child.visible && !child.layoutAbsolute);
    const ordered = nodes
      .map((node) => ({ node, at: localCenter(node, frame, kinds) }))
      .sort((a, b) => (comesBefore(a.at, b.at, layout) ? -1 : 1));
    const keys = generateNKeysBetween(
      stay[before - 1]?.index ?? null,
      stay[before]?.index ?? null,
      ordered.length,
    );
    ordered.forEach(({ node }, i) => {
      const index = keys[i];
      if (index && index !== node.index) patches.set(node.id, { index });
    });
  }
  if (patches.size > 0) doc.updateMany(patches);
}

/** Its middle in the frame's own space (`toFrameSpace`). */
function localCenter(node: DesignNode, frame: DesignNode, kinds: ElementKinds): Point {
  return toFrameSpace(rectCenter(elementBounds(kinds.kindOf(node), node)), frame);
}

/** Whether a layer at `a` comes before one at `b` (wrapped: by line, then along it). */
function comesBefore(a: Point, b: Point, layout: AutoLayout): boolean {
  const [p, c] = layout.direction === "horizontal" ? (["x", "y"] as const) : (["y", "x"] as const);
  if (layout.wrap && Math.abs(a[c] - b[c]) > 1) return a[c] < b[c];
  return a[p] < b[p];
}
