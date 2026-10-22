import type { CanvasElement, ElementInteraction } from "../elements";
import type { Rect } from "../geometry.types";
import type { PlacedGuide } from "../ruler-guides";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * What dragging a resize handle does: `resize` changes the bounds (text rewraps, strokes keep
 * their weight), `scale` scales the selection and everything in it like a picture (the Scale
 * tool, K; always proportional).
 */
export type ResizeMode = "resize" | "scale";

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
  /** Degrees `box` is turned by around its top-left corner (one turned element's). */
  rotation: number;
  /** Whether it has resize handles; without, it only turns (e.g. a group). */
  resizable: boolean;
}

/** What a press at a point grabs, before falling back to the element under it. */
export type Interaction =
  | { kind: "resize"; target: ResizeTarget; handle: ResizeHandle }
  /** Just outside a corner of the selection's box: turns it (`corner` is nw, ne, se or sw). */
  | { kind: "rotate"; target: ResizeTarget; corner: ResizeHandle }
  /** A ruler guide of the scope on screen (see `CanvasGuides`). */
  | { kind: "guide"; guide: PlacedGuide }
  /** Something the element's kind offers (see `ElementKind.interactionAt`). */
  | { kind: "element"; element: CanvasElement; interaction: ElementInteraction };
