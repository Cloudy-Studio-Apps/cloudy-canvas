import { useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import { useIsActiveTab } from "./use-is-active-tab";

/**
 * Suspends the editor's engine while its tab is in the background (no drawing, no input) and
 * resumes it when the tab comes back. Editors call it once they have an engine.
 */
export function useSuspendWhenHidden<O extends object>(engine: CanvasEngine<O> | null): void {
  const active = useIsActiveTab();
  useEffect(() => {
    engine?.setSuspended(!active);
  }, [engine, active]);
}
