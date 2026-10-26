import { useEffect } from "react";

import { isSheet } from "../../sheet/is-sheet";
import { STYLEGUIDE_MODE_ID } from "../../mode/styleguide-mode.constants";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";

/**
 * In the Design system mode, a section selected on the canvas becomes what the sidebar shows
 * (a session hook).
 */
export function useStyleguideSelection(): void {
  const engine = useDesignEngine();
  const inMode = useDesignState((state) => state.mode === STYLEGUIDE_MODE_ID);
  const selectedId = useDesignState((state) => state.selectedId);
  useEffect(() => {
    if (!inMode || !selectedId) return;
    const el = engine.getElement(selectedId);
    if (!isSheet(el)) return;
    const { selected, select } = useStyleguideViewStore.getState();
    if (selected?.category !== el.sheet.category) select({ category: el.sheet.category });
  }, [engine, inMode, selectedId]);
}
