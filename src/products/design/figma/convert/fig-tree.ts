import type { FigGuid, FigNode } from "./fig-node.types";
import type { FigTree } from "./fig-tree.types";

/** A guid as a map key. */
export function guidKey(guid: FigGuid | undefined): string {
  return guid ? `${guid.sessionID}:${guid.localID}` : "";
}

/**
 * The file's nodes by guid, and each one's children bottom to top (Figma orders siblings by
 * their position strings, the last drawn on top). Removed nodes are left out.
 */
export function buildFigTree(nodeChanges: readonly FigNode[]): FigTree {
  const nodes = new Map<string, FigNode>();
  const children = new Map<string, FigNode[]>();
  let root: FigNode | null = null;
  for (const node of nodeChanges) {
    if (node.phase === "REMOVED") continue;
    nodes.set(guidKey(node.guid), node);
    if (node.type === "DOCUMENT") root = node;
    const parent = node.parentIndex?.guid;
    if (!parent) continue;
    const key = guidKey(parent);
    const list = children.get(key);
    if (list) list.push(node);
    else children.set(key, [node]);
  }
  for (const list of children.values()) list.sort(byPosition);
  if (!root) throw new Error("The Figma file has no document.");
  return {
    root,
    node: (guid) => nodes.get(guidKey(guid)),
    childrenOf: (node) => children.get(guidKey(node.guid)) ?? [],
  };
}

function byPosition(a: FigNode, b: FigNode): number {
  const pa = a.parentIndex?.position ?? "";
  const pb = b.parentIndex?.position ?? "";
  return pa < pb ? -1 : pa > pb ? 1 : 0;
}
