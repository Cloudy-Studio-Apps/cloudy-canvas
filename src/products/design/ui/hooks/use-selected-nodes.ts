import { useCallback, useMemo, useSyncExternalStore } from "react";

import { isDesignNode, type DesignNode } from "@design";
import { useDesignEngine, useDesignState } from "../design-engine-context";

/**
 * The selected design nodes as the scene has them, re-read when the document changes (edits,
 * undo). The same array until the selection or one of its nodes changes.
 */
export function useSelectedNodes(): readonly DesignNode[] {
  const engine = useDesignEngine();
  const ids = useDesignState((state) => state.selectedIds);
  const subscribe = useCallback((listener: () => void) => engine.onViewChange(listener), [engine]);
  // The scene's list is replaced on every document change and kept otherwise.
  const elements = useSyncExternalStore(subscribe, () => engine.elements());
  return useMemo(() => {
    const byId = new Map(elements.map((el) => [el.id, el]));
    return ids.map((id) => byId.get(id)).filter((el) => el !== undefined && isDesignNode(el));
  }, [elements, ids]);
}
