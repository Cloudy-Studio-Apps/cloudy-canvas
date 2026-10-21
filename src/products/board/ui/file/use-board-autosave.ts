import { useEffect, useRef } from "react";

import type { BoardEngine } from "@board";
import { debounce } from "@canvas";

/** Changes are saved once they stop for this long… */
const AUTOSAVE_DELAY_MS = 1500;
/** …or after this long of continuous editing. */
const AUTOSAVE_MAX_WAIT_MS = 10_000;

/**
 * Runs `autosave` shortly after the board changes, and once more when the editor closes or
 * autosave is turned off, so nothing pending is lost. `autosave` skips a board with no changes.
 */
export function useBoardAutosave(
  engine: BoardEngine,
  autosave: () => Promise<void>,
  enabled: boolean,
): void {
  const autosaveRef = useRef(autosave);
  useEffect(() => {
    autosaveRef.current = autosave;
  }, [autosave]);

  useEffect(() => {
    if (!enabled) return;
    let maxWait: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
      void autosaveRef.current();
    };
    const debounced = debounce(run, AUTOSAVE_DELAY_MS);
    const schedule = () => {
      debounced();
      maxWait ??= setTimeout(run, AUTOSAVE_MAX_WAIT_MS);
    };
    // Changes made while autosave was off are saved now.
    schedule();
    const removeObserver = engine.doc.onChange(schedule);
    return () => {
      removeObserver();
      run();
    };
  }, [engine, enabled]);
}
