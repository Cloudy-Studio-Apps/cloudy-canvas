import type { DesignNode, LayerTree } from "@design";

export interface LayerRowProps {
  node: DesignNode;
  tree: LayerTree;
  depth: number;
  selected: ReadonlySet<string>;
  /** Ids of the selection's ancestors, which open to show it. */
  revealed: ReadonlySet<string>;
}
