import { setPathsPatch, type ElementPatch } from "@canvas";

import type { DesignNode } from "../core";
import type { ColorRef } from "./selection-colors.types";

/**
 * The patches giving every place in `refs` a new color and opacity, by node id. Nodes come from
 * `nodeOf` (the current ones); places that are gone are skipped.
 */
export function recolorPatches(
  refs: readonly ColorRef[],
  color: string,
  opacity: number,
  nodeOf: (id: string) => DesignNode | undefined,
): Map<string, ElementPatch> {
  const values = new Map<string, Record<string, unknown>>();
  for (const { nodeId, path } of refs) {
    const own = values.get(nodeId) ?? {};
    own[path] = color;
    own[`${path.slice(0, -".color".length)}.opacity`] = opacity;
    values.set(nodeId, own);
  }
  const patches = new Map<string, ElementPatch>();
  for (const [id, paths] of values) {
    const node = nodeOf(id);
    if (!node) continue;
    // `setPathsPatch` takes one root field at a time.
    const byRoot = new Map<string, Record<string, unknown>>();
    for (const [path, value] of Object.entries(paths)) {
      const root = path.split(".")[0] ?? path;
      byRoot.set(root, { ...byRoot.get(root), [path]: value });
    }
    let patch: Record<string, unknown> = {};
    for (const rootValues of byRoot.values()) {
      const part = setPathsPatch({ ...node, ...patch }, rootValues);
      if (part) patch = { ...patch, ...part };
    }
    if (Object.keys(patch).length > 0) patches.set(id, patch as ElementPatch<DesignNode>);
  }
  return patches;
}
