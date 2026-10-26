import {
  groupTree,
  type StyleRecord,
  type TokenGroupNode,
  type TokenStore,
  type VariableRecord,
} from "@canvas";

import type { SheetGroup } from "../styleguide.types";

/** Every group of a tree that holds items itself, depth first (a nested group is a group of its own). */
function leafGroups<T extends { name: string }>(node: TokenGroupNode<T>): TokenGroupNode<T>[] {
  const own = node.variables.length > 0 ? [node] : [];
  return [...own, ...node.groups.flatMap((group) => leafGroups(group))];
}

/**
 * Variables as sheet groups: per collection (in the store's order), then by group path. With
 * several collections, titles say which one (`Primitives · blue`).
 */
export function variableGroups(
  variables: readonly VariableRecord[],
  store: TokenStore,
): SheetGroup[] {
  const shown = variables.filter((variable) => !variable.hidden);
  const collections = store
    .collections()
    .filter((collection) => shown.some((v) => v.collectionId === collection.id));
  const several = collections.length > 1;
  return collections.flatMap((collection) =>
    leafGroups(groupTree(shown.filter((v) => v.collectionId === collection.id))).map((node) => ({
      id: `${collection.id}/${node.path}`,
      title: several
        ? node.path
          ? `${collection.name} · ${node.path}`
          : collection.name
        : node.path,
      items: node.variables.map((record) => ({ kind: "variable" as const, record })),
    })),
  );
}

/** Styles as sheet groups, by their name's group path. */
export function styleGroups(styles: readonly StyleRecord[]): SheetGroup[] {
  return leafGroups(groupTree(styles)).map((node) => ({
    id: `styles/${node.path}`,
    title: node.path,
    items: node.variables.map((record) => ({ kind: "style" as const, record })),
  }));
}
