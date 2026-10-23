import type { FigGuid, FigNode, FigStyleRef } from "./fig-node.types";

/** The file's nodes, looked up by guid, with their children in drawing order. */
export interface FigTree {
  /** The `DOCUMENT` node; its children are the pages. */
  root: FigNode;
  node(guid: FigGuid | undefined): FigNode | undefined;
  /** Bottom to top. */
  childrenOf(node: FigNode): readonly FigNode[];
  /** The style node a reference names (by guid, or by its library key), if it's in the file. */
  style(ref: FigStyleRef | undefined): FigNode | undefined;
}
