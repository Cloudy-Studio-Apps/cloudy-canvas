import type { Paint } from "./paint.types";

/** One paint stack of a node and where it lives (`fills`, `strokes`, `network.regions.2.fills`). */
export interface NodePaintStack {
  path: string;
  paints: readonly Paint[];
}
