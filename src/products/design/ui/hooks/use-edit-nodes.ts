import { useCallback } from "react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import { useDesignEngine } from "../design-engine-context";
import type { EditNodesOptions } from "./use-edit-nodes.types";

/**
 * Edits nodes as one undo step: `patchOf` gives each node's patch (`null` leaves it alone).
 * Panels edit the document through this, never through React state. `checkpoint: false` adds the
 * edit to the current undo step (the later steps of a drag).
 */
export function useEditNodes(): (
  nodes: readonly DesignNode[],
  patchOf: (node: DesignNode) => ElementPatch<DesignNode> | null,
  options?: EditNodesOptions,
) => void {
  const engine = useDesignEngine();
  return useCallback(
    (nodes, patchOf, { checkpoint = true } = {}) => {
      const patches = new Map<string, ElementPatch>();
      for (const node of nodes) {
        const patch = patchOf(node);
        if (patch) patches.set(node.id, patch);
      }
      if (patches.size === 0) return;
      if (checkpoint) engine.doc.checkpoint();
      engine.doc.updateMany(patches);
    },
    [engine],
  );
}
