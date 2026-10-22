import type { CanvasElement, ElementKinds } from "../elements";
import type { Rect } from "../geometry.types";

/** An edge or center line elements line up on. */
export type Alignment = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";

/** Which way elements are spread out evenly: `x` horizontally, `y` vertically. */
export type DistributeAxis = "x" | "y";

/** Something arranged as one: an element (with what moves with it) and its outline. */
export interface ArrangeItem {
  id: string;
  rect: Rect;
}

/** What `arrangeItems` reads from the engine. */
export interface ArrangeHost {
  /** An element as the scene sees it. */
  get(id: string): CanvasElement | undefined;
  kinds: ElementKinds;
  /** The ids plus what moves with them. */
  withMembers(ids: Iterable<string>): Set<string>;
}

/** What a turn goes round: the middle of everything turned, or each element's own middle. */
export type RotatePivot = "selection" | "each";
