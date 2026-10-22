import type { FigMatrix, FigNode } from "@canvas/figma";

import type { FigJamContext } from "./figjam-context";
import type { FigJamOutput } from "./figjam-output";

/** Where a node is converted: its world transform, and where its elements go. */
export interface FigJamPlacement {
  /** The node's own transform in the world (its parent's times its own). */
  world: FigMatrix;
  /** The node's parent's world transform. */
  parentWorld: FigMatrix;
  out: FigJamOutput;
  ctx: FigJamContext;
}

/** Converts one kind of node, adding what it becomes to `placement.out`. */
export type FigJamNodeConverter = (node: FigNode, placement: FigJamPlacement) => void;
