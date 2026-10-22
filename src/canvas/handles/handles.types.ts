import type { CanvasElement, ElementInteraction } from "../elements";
import type { Rect } from "../geometry.types";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/** How a resize handle drag shapes the rect (see `resizeRect`). */
export interface ResizeOptions {
  /** Keep the proportions (Shift, or always for some kinds). */
  keepRatio: boolean;
  /** Grow or shrink round the center instead of the opposite side (Alt). */
  fromCenter: boolean;
}

/**
 * What the resize handles resize: one element by its bounds, or a multi-selection by the box
 * around it, which scales every element in it.
 */
export interface ResizeTarget {
  elements: CanvasElement[];
  box: Rect;
}

/** What a press at a point grabs, before falling back to the element under it. */
export type Interaction =
  | { kind: "resize"; target: ResizeTarget; handle: ResizeHandle }
  /** Something the element's kind offers (see `ElementKind.interactionAt`). */
  | { kind: "element"; element: CanvasElement; interaction: ElementInteraction };
