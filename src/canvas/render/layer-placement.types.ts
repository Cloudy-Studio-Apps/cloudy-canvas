import type { CanvasElement, ElementKind } from "../elements";
import type { Rect } from "../geometry.types";

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

/** Where an element layer puts each view: its place in the stack and its clip. */
export interface LayerPlacement {
  orderOf: OrderKeyOf;
  clipOf: ClipOf;
}
