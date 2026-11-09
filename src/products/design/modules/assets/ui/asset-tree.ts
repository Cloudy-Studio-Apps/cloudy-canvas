import type { LibraryAsset } from "@canvas";
import type { AssetFilter, AssetNode } from "./assets-ui.types";

/** A group path cleaned: segments trimmed, empty ones dropped (`" Brand // Logo/"` → `"Brand/Logo"`). */
export function normalizeGroup(path: string): string {
  return path
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

/** The pictures whose name or group has `query` and whose type is `filter`'s. */
export function filterAssets(
  assets: readonly LibraryAsset[],
  query: string,
  filter: AssetFilter,
): LibraryAsset[] {
  const text = query.trim().toLowerCase();
  return assets.filter(
    (asset) =>
      (filter === "all" || asset.type === filter) &&
      (text === "" ||
        asset.name.toLowerCase().includes(text) ||
        asset.group.toLowerCase().includes(text)),
  );
}

/** Pictures as a tree of groups from their slash paths; the root holds the ungrouped ones. */
export function assetTree(assets: readonly LibraryAsset[]): AssetNode {
  const root: AssetNode = { path: "", name: "", assets: [], groups: [] };
  const nodes = new Map<string, AssetNode>([["", root]]);
  const nodeFor = (path: string): AssetNode => {
    const known = nodes.get(path);
    if (known) return known;
    const cut = path.lastIndexOf("/");
    const node: AssetNode = { path, name: path.slice(cut + 1), assets: [], groups: [] };
    nodeFor(path.slice(0, Math.max(cut, 0))).groups.push(node);
    nodes.set(path, node);
    return node;
  };
  for (const asset of assets) nodeFor(normalizeGroup(asset.group)).assets.push(asset);
  return root;
}

/** How many pictures a group holds, its own groups' included. */
export function countAssets(node: AssetNode): number {
  return node.assets.length + node.groups.reduce((n, group) => n + countAssets(group), 0);
}
