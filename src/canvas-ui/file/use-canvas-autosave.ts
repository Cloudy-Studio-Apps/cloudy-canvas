import { useEffect, useRef } from "react";

import { debounce, type CanvasEngine } from "@canvas";
import { appLifecycle } from "@platform";

/** Changes are saved once they stop for this long… */
const AUTOSAVE_DELAY_MS = 1500;
/** …or after this long of continuous editing. */
const AUTOSAVE_MAX_WAIT_MS = 10_000;

/**
 * Runs `autosave` shortly after the document changes, and once more when the editor or the window
 * closes or autosave is turned off, so nothing pending is lost. `autosave` skips a file with no
 * changes.
 */
export function useCanvasAutosave<O extends object>(
  engine: CanvasEngine<O>,
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
    // Closing the window waits for pending changes to be saved.
    const removeQuitTask = appLifecycle.onBeforeQuit(() => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
      return autosaveRef.current();
    });
    return () => {
      removeObserver();
      removeQuitTask();
      run();
    };
  }, [engine, enabled]);
}
