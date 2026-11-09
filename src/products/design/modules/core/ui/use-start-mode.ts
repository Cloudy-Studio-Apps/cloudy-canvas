import { useEffect } from "react";

import { useCanvasFile, useDropTabParam, useTabParam } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useDesignModeStore } from "@shared/stores/design-mode-store";

/**
 * Opens the design in the mode its link asks for (Home's "New Catalog"), else in the one it was
 * left in, and remembers the mode it's in. Unknown modes are ignored (`engine.setMode`).
 */
export function useStartMode(): void {
  const engine = useDesignEngine();
  const { id } = useCanvasFile();
  const mode = useDesignState((state) => state.mode);
  // The link's query parameter naming the mode a design opens in (`/design/<id>?mode=catalog`).
  const asked = useTabParam("mode");
  const dropParam = useDropTabParam();

  useEffect(() => {
    const start = asked ?? useDesignModeStore.getState().modes[id];
    if (start) engine.setMode(start);
    if (asked) dropParam("mode");
  }, [engine, id, asked, dropParam]);

  useEffect(() => useDesignModeStore.getState().remember(id, mode), [id, mode]);
}
