import { useState, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_TREE, type LayerTree } from "@design";

/** The layer tree, read again only when the document changes. */
export function useLayerTree(): LayerTree {
  const tree = useService(DESIGN_TREE);
  const version = useSyncExternalStore(tree.subscribe, tree.getVersion);
  const [cache, setCache] = useState(() => ({ version, layers: tree.layers() }));
  if (cache.version !== version) {
    const next = { version, layers: tree.layers() };
    setCache(next);
    return next.layers;
  }
  return cache.layers;
}
