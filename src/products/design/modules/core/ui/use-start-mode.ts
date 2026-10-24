import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { useCanvasFile } from "@canvas-ui";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useDesignModeStore } from "@design/ui/stores/design-mode-store";

/** The link's query parameter naming the mode a design opens in (`/design/<id>?mode=catalog`). */
const MODE_PARAM = "mode";

/**
 * Opens the design in the mode its link asks for (Home's "New Catalog"), else in the one it was
 * left in, and remembers the mode it's in. Unknown modes are ignored (`engine.setMode`).
 */
export function useStartMode(): void {
  const engine = useDesignEngine();
  const { id } = useCanvasFile();
  const mode = useDesignState((state) => state.mode);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const asked = params.get(MODE_PARAM);
    const start = asked ?? useDesignModeStore.getState().modes[id];
    if (start) engine.setMode(start);
    if (asked) {
      setParams(
        (current) => {
          current.delete(MODE_PARAM);
          return current;
        },
        { replace: true },
      );
    }
  }, [engine, id, params, setParams]);

  useEffect(() => useDesignModeStore.getState().remember(id, mode), [id, mode]);
}
