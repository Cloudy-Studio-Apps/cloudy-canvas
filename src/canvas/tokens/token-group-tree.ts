import type { TokenGroupNode } from "./token-group-tree.types";
import { tokenGroupOf } from "./token-path";
import type { VariableRecord } from "./token.types";

/**
 * Variables as a tree of groups from their slash paths; the root (path `""`) holds the ungrouped
 * ones. Groups keep the order their first variable appears in.
 */
export function groupTree<T extends { name: string } = VariableRecord>(
  variables: readonly T[],
): TokenGroupNode<T> {
  const root: TokenGroupNode<T> = { path: "", name: "", groups: [], variables: [] };
  const nodes = new Map<string, TokenGroupNode<T>>([["", root]]);
  const nodeFor = (path: string): TokenGroupNode<T> => {
    const known = nodes.get(path);
    if (known) return known;
    const parent = nodeFor(tokenGroupOf(path));
    const node: TokenGroupNode<T> = {
      path,
      name: path.slice(path.lastIndexOf("/") + 1),
      groups: [],
      variables: [],
    };
    parent.groups.push(node);
    nodes.set(path, node);
    return node;
  };
  for (const variable of variables) nodeFor(tokenGroupOf(variable.name)).variables.push(variable);
  return root;
}
