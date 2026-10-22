import { useCallback } from "react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";
import { useDesignEngine } from "../design-engine-context";

/**
 * Moves nodes by their own offsets (`offsetOf`) with everything they hold, as one undo step:
 * moving a frame from the panel moves its children like a drag does.
 */
export function useMoveNodes(): (
  nodes: readonly DesignNode[],
  offsetOf: (node: DesignNode) => { dx: number; dy: number },
) => void {
  const engine = useDesignEngine();
  return useCallback(
    (nodes, offsetOf) => {
      const patches = new Map<string, ElementPatch>();
      for (const node of nodes) {
        const { dx, dy } = offsetOf(node);
        if (dx === 0 && dy === 0) continue;
        for (const id of engine.withMembers([node.id], "move")) {
          const el = engine.getElement(id);
          if (el && !patches.has(id)) patches.set(id, engine.kinds.kindOf(el).move(el, dx, dy));
        }
      }
      if (patches.size === 0) return;
      engine.doc.checkpoint();
      engine.doc.updateMany(patches);
    },
    [engine],
  );
}
