import type { ScopeSlot } from "@canvas";

/** Where a scene's nodes and scopes are drawn (see `treeSlots`). */
export interface TreeSlots {
  /** The innermost slot a node's view is drawn in. */
  homeOf(id: string): ScopeSlot | null;
  /** Where a node's effect scope is drawn. */
  effectHome(id: string): ScopeSlot | null;
  /** Where a mask's scope is drawn: where its parent is. */
  maskHome(id: string): ScopeSlot | null;
  /** Masked node id → the mask masking it (`siblingMasks`). */
  masked: ReadonlyMap<string, string>;
}
