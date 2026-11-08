import { useEffect, useMemo } from "react";

import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { isScreen, screenOf, type PrototypeSelection } from "../../model";
import { usePrototypeViewStore } from "../stores/prototype-view-store";

/**
 * What the Prototype mode's panels are about: the flow picked in the Flows tab while the canvas
 * selection is empty, else the one selected element as a screen or a layer (several count as
 * none). Selecting on the canvas drops the picked flow.
 */
export function usePrototypeSelection(): PrototypeSelection {
  const engine = useDesignEngine();
  const ids = useDesignState((state) => state.selectedIds);
  const flow = usePrototypeViewStore((state) => state.selectedFlow);
  useEffect(() => {
    if (ids.length > 0 && flow !== null) usePrototypeViewStore.getState().selectFlow(null);
  }, [ids, flow]);
  return useMemo(() => {
    if (ids.length === 0) return flow ? { kind: "flow", id: flow } : { kind: "none" };
    const [id, ...others] = ids;
    if (id === undefined || others.length > 0) return { kind: "none" };
    const screen = screenOf(engine.doc, id);
    if (!screen) return { kind: "none" };
    return isScreen(engine.doc.get(id))
      ? { kind: "screen", id }
      : { kind: "layer", id, screen: screen.id };
  }, [engine, ids, flow]);
}
