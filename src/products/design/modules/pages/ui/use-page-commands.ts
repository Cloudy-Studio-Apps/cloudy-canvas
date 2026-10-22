import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { stepPage } from "./page-actions";

/** Runs the previous page (PageUp) and next page (PageDown) commands. */
export function usePageCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const removePrevious = engine.handleHostAction("previousPage", () => stepPage(engine, -1));
    const removeNext = engine.handleHostAction("nextPage", () => stepPage(engine, 1));
    return () => {
      removePrevious();
      removeNext();
    };
  }, [engine]);
}
