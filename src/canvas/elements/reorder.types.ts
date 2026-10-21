import type { Rect } from "../geometry.types";
import type { CanvasElement } from "./element.types";

/** Where `reorderIndexes` moves elements in the drawing order. */
export type ReorderDirection = "front" | "forward" | "backward" | "back";

export interface ReorderInput {
  /** The elements of one drawing layer, bottom to top (by index). */
  layer: readonly CanvasElement[];
  /** Ids of the elements to move (others in the list are ignored). */
  moving: ReadonlySet<string>;
  direction: ReorderDirection;
  bounds(el: CanvasElement): Rect;
  /** `count` indexes above / below every element in the document, for `front` and `back`. */
  above(count: number): string[];
  below(count: number): string[];
}
