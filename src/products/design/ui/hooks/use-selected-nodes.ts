import { useMemo } from "react";

import { isDesignNode, type DesignNode } from "@design";
import { useDesignState } from "../design-engine-context";
import { useSceneElements } from "./use-scene-elements";

/**
 * The selected design nodes as the scene has them, re-read when the document changes (edits,
 * undo). The same array until the selection or one of its nodes changes.
 */
export function useSelectedNodes(): readonly DesignNode[] {
  const ids = useDesignState((state) => state.selectedIds);
  const elements = useSceneElements();
  return useMemo(() => {
    const byId = new Map(elements.map((el) => [el.id, el]));
    return ids.map((id) => byId.get(id)).filter((el) => el !== undefined && isDesignNode(el));
  }, [elements, ids]);
}
