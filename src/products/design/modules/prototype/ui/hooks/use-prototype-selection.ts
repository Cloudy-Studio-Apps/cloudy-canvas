import { useEffect, useMemo } from "react";

import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { prototypeSelection, type PrototypeSelection } from "../../model";
import { usePrototypePage } from "./use-prototype-page";
import { usePrototypeViewStore } from "../stores/prototype-view-store";

/**
 * What the Prototype mode's panels are about: the flow picked in the Flows tab while the canvas
 * selection is empty, else the one selected element as a screen or a layer (several count as
 * none). Selecting on the canvas drops the picked flow.
 */
export function usePrototypeSelection(): PrototypeSelection {
  const engine = useDesignEngine();
  const ids = useDesignState((state) => state.selectedIds);
  const picked = usePrototypeViewStore((state) => state.selectedFlow);
  // A picked flow that is gone (undone, deleted elsewhere) counts as none.
  const { flows } = usePrototypePage();
  const flow = picked !== null && flows.some((f) => f.id === picked) ? picked : null;
  useEffect(() => {
    if (ids.length > 0 && picked !== null) usePrototypeViewStore.getState().selectFlow(null);
  }, [ids, picked]);
  return useMemo(() => prototypeSelection(engine.doc, ids, flow), [engine, ids, flow]);
}
