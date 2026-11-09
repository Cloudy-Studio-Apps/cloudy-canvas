import { useCallback, useEffect, useMemo, useRef } from "react";

import { debounce, type CanvasEngine } from "@canvas";
import { appLifecycle } from "@platform";
import type { AutosaveControls, FinalWork } from "./use-canvas-autosave.types";

/** Changes are saved once they stop for this long… */
const AUTOSAVE_DELAY_MS = 1500;
/** …or after this long of continuous editing. */
const AUTOSAVE_MAX_WAIT_MS = 10_000;

const noop = (): void => undefined;

/**
 * Runs `autosave` shortly after the document changes, and once more when the editor or the window
 * closes, the app goes to the background or autosave is turned off, so nothing pending is lost.
 * `autosave` skips a file with no changes. The engine also sweeps the assets nothing uses (see
 * `CanvasEngine.sweepAssets`) on open, and when the editor or the window closes: the closing save
 * first awaits the engine's `onBeforeSave` tasks (a live 3D edit writing itself), then sweeps, then
 * saves. It returns `flush` (the pending autosave now) and `finish` (the closing work now, for a
 * tab about to close), both doing no saving while autosave is off.
 */
export function useCanvasAutosave<O extends object>(
  engine: CanvasEngine<O>,
  autosave: (force?: boolean) => Promise<void>,
  enabled: boolean,
): AutosaveControls {
  const autosaveRef = useRef(autosave);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    autosaveRef.current = autosave;
    enabledRef.current = enabled;
  }, [autosave, enabled]);
  /** The engine's last work before its closing save, once it started (see `finalWork`). */
  const finalRef = useRef<FinalWork | null>(null);
  /** Cancels the scheduled autosave, while autosave is on. */
  const cancelRef = useRef<() => void>(noop);

  // Sweeps unused 3D data when the file opens, and starts the final work before quitting and when
  // the editor closes (never in the autosave: undo could still need it). Not gated by `enabled`.
  useEffect(() => {
    engine.sweepAssets();
    const removeQuitTask = appLifecycle.onBeforeQuit(async () => {
      await finalWork(finalRef, engine);
    });
    return () => {
      removeQuitTask();
      void finalWork(finalRef, engine);
    };
  }, [engine]);

  useEffect(() => {
    if (!enabled) return;
    // Read when the cleanup runs, on purpose: the final work starts in the other effect's cleanup.
    const finals = finalRef;
    let maxWait: ReturnType<typeof setTimeout> | undefined;
    const run = (force = false) => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
      void autosaveRef.current(force);
    };
    const debounced = debounce(() => run(), AUTOSAVE_DELAY_MS);
    const schedule = () => {
      debounced();
      maxWait ??= setTimeout(() => run(), AUTOSAVE_MAX_WAIT_MS);
    };
    // Changes made while autosave was off are saved now.
    schedule();
    const removeObserver = engine.doc.onChange(schedule);
    const cancel = () => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
    };
    cancelRef.current = cancel;
    const saveNow = (force = false) => {
      cancel();
      return autosaveRef.current(force);
    };
    // Closing the window waits for pending changes to be saved; a phone may not warn it's closing.
    const removeQuitTask = appLifecycle.onBeforeQuit(async () => {
      const changed = await finalWork(finalRef, engine).catch(() => true);
      await saveNow(changed);
    });
    const removeBackgroundTask = appLifecycle.onBackground(() => saveNow());
    return () => {
      cancelRef.current = noop;
      removeObserver();
      removeQuitTask();
      removeBackgroundTask();
      // Decided once every cleanup of this commit ran, whatever their order: the editor closing
      // (the final work started) saves once that's done, even when only that work changed the
      // document (the file's change count stopped with the editor); autosave turned off saves
      // what's there.
      queueMicrotask(() => {
        const final = finals.current?.engine === engine ? finals.current.done : null;
        if (final) void final.then(run, () => run(true));
        else run();
      });
    };
  }, [engine, enabled]);

  const flush = useCallback(async () => {
    if (!enabledRef.current) return;
    cancelRef.current();
    await autosaveRef.current();
  }, []);

  const finish = useCallback(async () => {
    const changed = await finalWork(finalRef, engine).catch(() => true);
    if (!enabledRef.current) return;
    cancelRef.current();
    await autosaveRef.current(changed);
  }, [engine]);

  return useMemo(() => ({ flush, finish }), [flush, finish]);
}

/**
 * Finishes what must be written before the last save (`engine.finishBeforeSave`), then sweeps the
 * unused assets; resolves to whether that changed the document. Runs once per engine: quitting
 * and closing share it, and the closing save awaits it whichever started it.
 */
function finalWork<O extends object>(
  ref: { current: FinalWork | null },
  engine: CanvasEngine<O>,
): Promise<boolean> {
  if (ref.current?.engine === engine) return ref.current.done;
  const done = (async () => {
    let changed = false;
    const stop = engine.doc.onChange(() => {
      changed = true;
    });
    try {
      await engine.finishBeforeSave();
      engine.sweepAssets();
    } finally {
      stop();
    }
    return changed;
  })();
  ref.current = { engine, done };
  return done;
}
