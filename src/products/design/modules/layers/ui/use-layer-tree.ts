import { useState, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_TREE, type LayerTree } from "../../core";
import { useDesignState } from "@design/ui/design-engine-context";

/** The layer tree of the page on screen, read again only when the document or the page changes. */
export function useLayerTree(): LayerTree {
  const tree = useService(DESIGN_TREE);
  const page = useDesignState((state) => state.scope);
  const version = useSyncExternalStore(tree.subscribe, tree.getVersion);
  const [cache, setCache] = useState(() => ({ version, page, layers: tree.layers(page) }));
  if (cache.version !== version || cache.page !== page) {
    const next = { version, page, layers: tree.layers(page) };
    setCache(next);
    return next.layers;
  }
  return cache.layers;
}
