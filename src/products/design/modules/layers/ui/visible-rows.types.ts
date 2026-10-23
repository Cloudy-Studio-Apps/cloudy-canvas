import type { DesignNode } from "@design";

/** One row of the layers list: a layer shown at its depth in the tree. */
export interface LayerRowItem {
  node: DesignNode;
  depth: number;
  /** Its parent in the tree (`null`: the top of the page). */
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  /** Whether it's its parent's bottom-most child (dropping below it can leave the parent). */
  last: boolean;
}
