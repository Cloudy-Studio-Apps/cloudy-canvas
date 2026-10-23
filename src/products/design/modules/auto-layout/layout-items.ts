import {
  boundsOfPoints,
  type BoxSides,
  rotatedCorners,
  type CanvasElement,
  type ElementKinds,
  type Rect,
} from "@canvas";

import {
  DesignNodeKind,
  hasVisibleStroke,
  layoutOf,
  resolveTree,
  type AutoLayout,
  type DesignNode,
} from "../core";
import { toFrameSpace } from "./frame-space";
import type { LayoutFrameInput, LayoutItem } from "./layout-frame.types";
import type { LayoutTree, PlacedChild } from "./layout-tree.types";

/**
 * What `layoutFrame` needs to lay out an auto layout frame: the frame and the layers it places
 * (visible ones that don't ignore the layout, in order), with the boxes they take now.
 */
export function frameLayoutInput(
  frame: DesignNode,
  tree: LayoutTree,
  kinds: ElementKinds,
): { input: LayoutFrameInput; items: LayoutItem[]; placed: Map<string, PlacedChild> } | null {
  const layout = layoutOf(frame);
  const kind = kinds.kindOf(frame);
  if (!layout || !(kind instanceof DesignNodeKind)) return null;
  const byBaseline = layout.counterAlign === "baseline";
  const placed = new Map<string, PlacedChild>();
  const items: LayoutItem[] = [];
  for (const child of tree.children(frame.id)) {
    if (!child.visible || child.layoutAbsolute) continue;
    const childKind = kinds.kindOf(child);
    if (!(childKind instanceof DesignNodeKind)) continue;
    const shown = childKind.childHost ? resolved(child, tree, kinds) : child;
    const turn = (shown.rotation ?? 0) - (frame.rotation ?? 0);
    const box = localBox(shown, frame);
    const moveOnly = childKind.childHost || Math.abs(turn) > 1e-6;
    placed.set(child.id, { node: child, box, moveOnly });
    const fills = (axis: "h" | "v") => !moveOnly && child.sizing[axis] === "fill";
    items.push({
      id: child.id,
      w: box.w,
      h: box.h,
      fillW: fills("h"),
      fillH: fills("v"),
      limits: child.sizeLimits,
      baseline: byBaseline && !moveOnly ? childKind.baseline(child) : null,
    });
  }
  const input: LayoutFrameInput = {
    layout: layout.strokesIncluded ? { ...layout, padding: strokePadding(frame, layout) } : layout,
    w: frame.w,
    h: frame.h,
    hugW: kind.hugs(frame, "h"),
    hugH: kind.hugs(frame, "v"),
    limits: frame.sizeLimits,
  };
  return { input, items, placed };
}

/** A node made of its children (a group) with its bounds worked out from them. */
function resolved(node: DesignNode, tree: LayoutTree, kinds: ElementKinds): DesignNode {
  const elements: CanvasElement[] = [];
  const queue = [node];
  for (let el = queue.pop(); el; el = queue.pop()) {
    elements.push(el);
    queue.push(...tree.children(el.id));
  }
  const found = resolveTree(elements, kinds).find((el) => el.id === node.id);
  return (found as DesignNode | undefined) ?? node;
}

/** Its box round its turn, in the frame's own space (`toFrameSpace`). */
export function localBox(node: DesignNode, frame: DesignNode): Rect {
  const corners = rotatedCorners(node, node.rotation ?? 0).map((p) => toFrameSpace(p, frame));
  return boundsOfPoints(corners.flatMap((p) => [p.x, p.y]));
}

/**
 * Its padding with its own strokes inside it (Figma's "strokes included": the frame's box holds
 * its border, as CSS's `border-box`): the part of each side's weight inside the box.
 */
function strokePadding(frame: DesignNode, layout: AutoLayout): BoxSides {
  const { padding } = layout;
  if (!hasVisibleStroke(frame)) return padding;
  const inside = frame.strokeAlign === "inside" ? 1 : frame.strokeAlign === "center" ? 0.5 : 0;
  const weight = frame.strokeWeight;
  const sides = frame.strokeWeights ?? { top: weight, right: weight, bottom: weight, left: weight };
  return {
    top: padding.top + sides.top * inside,
    right: padding.right + sides.right * inside,
    bottom: padding.bottom + sides.bottom * inside,
    left: padding.left + sides.left * inside,
  };
}
