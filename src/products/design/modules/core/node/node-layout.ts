import type { CanvasElement } from "@canvas";

import type { AutoLayout, NodeSizing } from "./node-layout.types";

/** Sizing on both axes for a layer that keeps its size. */
export const FIXED_SIZING: NodeSizing = { h: "fixed", v: "fixed" };

/** The auto layout an element lays its children out with (a frame's), or `null`. */
export function layoutOf(el: CanvasElement | undefined): AutoLayout | null {
  const layout = (el as { layout?: AutoLayout | null } | undefined)?.layout;
  return layout ?? null;
}
