import type { FigGuid, FigNode } from "./fig-node.types";

/** The file's nodes, looked up by guid, with their children in drawing order. */
export interface FigTree {
  /** The `DOCUMENT` node; its children are the pages. */
  root: FigNode;
  node(guid: FigGuid | undefined): FigNode | undefined;
  /** Bottom to top. */
  childrenOf(node: FigNode): readonly FigNode[];
}
