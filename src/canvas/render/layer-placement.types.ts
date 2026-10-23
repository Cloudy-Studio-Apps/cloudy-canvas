import type { Graphics } from "pixi.js";

import type { CanvasElement, ElementKind } from "../elements";
import type { Point, Rect } from "../geometry.types";

/** An element's drawing order key: views are stacked by these, compared as strings. */
export type OrderKeyOf = (el: CanvasElement, kind: ElementKind) => string;

/**
 * The world area an element is drawn and hit in, when something clips it (e.g. a frame that
 * clips its content): a rect, with rounded corners of `radius`, turned by `rotation` degrees
 * around its top-left corner (a turned frame's).
 */
export interface ElementClip {
  rect: Rect;
  radius: number;
  rotation?: number;
}

/** An element's clip, or `null` when nothing clips it. */
export type ClipOf = (el: CanvasElement) => ElementClip | null;

/**
 * How a mask shapes what it masks: by its pixels' opacity (`alpha`), by its outline alone, fully
 * opaque wherever it has a shape (`vector`), or by its pixels' brightness (`luminance`).
 */
export type MaskMode = "alpha" | "vector" | "luminance";

/** Where an element is drawn under a mask: as part of the mask itself, or masked by it. */
export interface MaskSlot {
  mask: string;
  role: "source" | "masked";
}

/** One outline of a vector mask, traced in its element's own frame (see `ElementMask.shape`). */
export interface MaskShape {
  /** The element's top-left corner, in world units. */
  x: number;
  y: number;
  /** Degrees counterclockwise round (x, y). */
  rotation: number;
  /** Traces the outline (the caller fills it). */
  trace(g: Graphics): void;
}

/**
 * An element that masks others: they show only where it does (or, `inverted`, only where it
 * doesn't). The mask isn't drawn itself; with what it holds (its `source` slot) it shapes the mask.
 */
export interface ElementMask {
  /** The mask element. */
  id: string;
  mode: MaskMode;
  inverted: boolean;
  /** Where the mask and what it masks are drawn: inside another mask, or `null` at the top. */
  home: MaskSlot | null;
  /** The world area the mask covers (where what it masks can show). */
  bounds: Rect;
  /**
   * Its outlines, for a `vector` mask (drawn crisp, as a stencil); `null` when some part of it has
   * no outline (a text), which then masks by its pixels made fully opaque.
   */
  shape: readonly MaskShape[] | null;
  /** Whether a world point is inside the mask's shape (what it masks can be clicked there). */
  contains(p: Point): boolean;
}

/** The masks of a canvas, and where each element under one is drawn. */
export interface ElementMasks {
  masks: ReadonlyMap<string, ElementMask>;
  /** Elements under a mask → their innermost slot; elements left out are under none. */
  homes: ReadonlyMap<string, MaskSlot>;
}

/** Where an element layer puts each view: its place in the stack, its clip and its masks. */
export interface LayerPlacement {
  orderOf: OrderKeyOf;
  clipOf: ClipOf;
  masks: () => ElementMasks;
}
