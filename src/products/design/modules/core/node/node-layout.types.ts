import type { BoxSides } from "@canvas";

/** Which way an auto layout lines its layers up. */
export type LayoutDirection = "horizontal" | "vertical";

/**
 * Where an auto layout puts its layers along its direction: packed at the start, the middle or
 * the end, or spread so the first and last touch the padding (Figma's "Auto" gap).
 */
export type LayoutAlign = "start" | "center" | "end" | "space-between";

/** Where an auto layout puts each layer across its direction (`baseline`: texts' first lines). */
export type LayoutCounterAlign = "start" | "center" | "end" | "baseline";

/**
 * A frame's auto layout (Figma's): its layers placed one after another in `index` order, with
 * `gap` between them and `padding` round them; a frame whose size hugs them grows with them.
 */
export interface AutoLayout {
  direction: LayoutDirection;
  /** Whether layers that don't fit go on to new lines (rows or columns). */
  wrap: boolean;
  /** The space between layers along the direction (with `space-between`, used when it hugs). */
  gap: number;
  /** The space between wrapped lines. */
  counterGap: number;
  padding: BoxSides;
  align: LayoutAlign;
  counterAlign: LayoutCounterAlign;
  /**
   * Whether its own strokes take space (Figma's "Strokes included in layout"): the part of each
   * side's weight inside its box adds to the padding, as CSS's `border-box`.
   */
  strokesIncluded: boolean;
  /** Whether the first layer is drawn on top (Figma's "Canvas stacking: first on top"). */
  reverseStacking: boolean;
}

/**
 * How a layer's width or height is decided: kept (`fixed`), the size of what it holds (`hug`, an
 * auto layout frame or a text) or the room its auto layout parent leaves (`fill`).
 */
export type LayoutSizing = "fixed" | "hug" | "fill";

/** A layer's sizing on each axis: `h` its width, `v` its height. */
export interface NodeSizing {
  h: LayoutSizing;
  v: LayoutSizing;
}

/** The smallest and largest a layer may become in an auto layout (unset: no limit). */
export interface SizeLimits {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

/** One axis of a box: `h` (x and width) or `v` (y and height). */
export type LayoutAxis = keyof NodeSizing;
