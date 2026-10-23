import type { MaskType } from "../core";

/** A layer in `get_layer_tree`, with what it holds. */
export interface LayerTreeNode {
  id: string;
  type: string;
  name: string;
  hidden?: true;
  locked?: true;
  /** Set on masks: how they mask, and whether inverted. */
  mask?: LayerMask;
  /** Topmost first; absent when it holds nothing. */
  children?: LayerTreeNode[];
}

/** How a mask layer masks (`get_layer_tree`, `list_nodes`). */
export interface LayerMask {
  type: MaskType;
  inverted?: true;
}
