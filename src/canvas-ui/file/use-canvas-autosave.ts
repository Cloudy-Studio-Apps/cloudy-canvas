import { useEffect, useRef } from "react";

import { debounce, type CanvasEngine } from "@canvas";
import { appLifecycle } from "@platform";

/** Changes are saved once they stop for this long… */
const AUTOSAVE_DELAY_MS = 1500;
/** …or after this long of continuous editing. */
const AUTOSAVE_MAX_WAIT_MS = 10_000;

/**
 * Runs `autosave` shortly after the document changes, and once more when the editor or the window
 * closes, the app goes to the background or autosave is turned off, so nothing pending is lost.
 * `autosave` skips a file with no changes. The engine also sweeps the assets nothing uses (see
 * `CanvasEngine.sweepAssets`) on open, before quitting and on close, ahead of the closing save.
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

  // Sweeps unused 3D data when the file opens, before quitting and when the editor closes (never
  // in the autosave: undo could still need it). It is declared before the autosave effect, so on
  // unmount its cleanup runs first and the closing save writes the sweep, and its quit task is
  // registered first: quit tasks start in registration order and this one does its work before its
  // first `await`, so the save task finds the document already swept. Not gated by `enabled`.
  useEffect(() => {
    engine.sweepAssets();
    const removeQuitTask = appLifecycle.onBeforeQuit(async () => {
      engine.sweepAssets();
    });
    return () => {
      removeQuitTask();
      engine.sweepAssets();
    };
  }, [engine]);

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
    const saveNow = () => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
      return autosaveRef.current();
    };
    // Closing the window waits for pending changes to be saved; a phone may not warn it's closing.
    const removeQuitTask = appLifecycle.onBeforeQuit(saveNow);
    const removeBackgroundTask = appLifecycle.onBackground(saveNow);
    return () => {
      removeObserver();
      removeQuitTask();
      removeBackgroundTask();
      run();
    };
  }, [engine, enabled]);
}
