import type { CanvasElement, ElementKinds, ElementPatch, ScaleTransform } from "../elements";
import type { Point, Rect } from "../geometry.types";
import type { ScaleAnchor } from "./scale.types";

/** The anchors in reading order (the Scale panel's 3×3 grid). */
export const SCALE_ANCHORS: readonly ScaleAnchor[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

/** Where an anchor sits on a box. */
export function anchorPoint({ x, y, w, h }: Rect, anchor: ScaleAnchor): Point {
  const ax = anchor.endsWith("left") ? 0 : anchor.endsWith("right") ? 1 : 0.5;
  const ay = anchor.startsWith("top") ? 0 : anchor.startsWith("bottom") ? 1 : 0.5;
  return { x: x + w * ax, y: y + h * ay };
}

/**
 * Each element's patch for scaling them all by `t` through their kinds. Give every element that
 * scales (members included, e.g. a frame's children), each as it was before the scale.
 */
export function scalePatches(
  elements: Iterable<CanvasElement>,
  kinds: ElementKinds,
  t: ScaleTransform,
): Map<string, ElementPatch> {
  const patches = new Map<string, ElementPatch>();
  for (const el of elements) patches.set(el.id, kinds.kindOf(el).scale(el, t));
  return patches;
}
