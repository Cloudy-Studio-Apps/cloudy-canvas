import { useCallback } from "react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import { useDesignEngine } from "../design-engine-context";

/**
 * Edits nodes as one undo step: `patchOf` gives each node's patch (`null` leaves it alone).
 * Panels edit the document through this, never through React state.
 */
export function useEditNodes(): (
  nodes: readonly DesignNode[],
  patchOf: (node: DesignNode) => ElementPatch<DesignNode> | null,
) => void {
  const engine = useDesignEngine();
  return useCallback(
    (nodes, patchOf) => {
      const patches = new Map<string, ElementPatch>();
      for (const node of nodes) {
        const patch = patchOf(node);
        if (patch) patches.set(node.id, patch);
      }
      if (patches.size === 0) return;
      engine.doc.checkpoint();
      engine.doc.updateMany(patches);
    },
    [engine],
  );
}
