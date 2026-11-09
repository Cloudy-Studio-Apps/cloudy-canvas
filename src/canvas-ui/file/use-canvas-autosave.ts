import { useCallback, useEffect, useMemo, useRef } from "react";

import { debounce, type CanvasEngine } from "@canvas";
import { appLifecycle } from "@platform";
import { finalWork, lastWrites } from "./closing-work";
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
 * `CanvasEngine.sweepAssets`) on open, and when its document goes (the window quits, the editor
 * closes for good): the closing save first awaits the engine's `onBeforeSave` tasks (a live 3D
 * edit writing itself), then sweeps, then saves. An editor that goes while its document stays
 * (`keepsDocument()` true as it unmounts: its tab dropped to `document`) only awaits those tasks
 * before its closing save: undo may still need the assets. It returns `flush` (the pending
 * autosave now), `finish` (the closing work now, for a document about to go), both doing no saving
 * while autosave is off, and `closed` (the work and save started as the editor unmounted).
 */
export function useCanvasAutosave<O extends object>(
  engine: CanvasEngine<O>,
  autosave: (force?: boolean) => Promise<void>,
  enabled: boolean,
  keepsDocument: () => boolean = () => false,
): AutosaveControls {
  const autosaveRef = useRef(autosave);
  const enabledRef = useRef(enabled);
  const keepsRef = useRef(keepsDocument);
  useEffect(() => {
    autosaveRef.current = autosave;
    enabledRef.current = enabled;
    keepsRef.current = keepsDocument;
  }, [autosave, enabled, keepsDocument]);
  /** The engine's final work, once started (see `finalWork`). */
  const finalRef = useRef<FinalWork | null>(null);
  /** The work started as the editor unmounted: the final work, or only the last writes. */
  const closingRef = useRef<FinalWork | null>(null);
  /** That work, and the save after it, for `closed`. */
  const closedWorkRef = useRef<Promise<unknown>>(Promise.resolve());
  const closedSaveRef = useRef<Promise<unknown>>(Promise.resolve());
  /** Cancels the scheduled autosave, while autosave is on. */
  const cancelRef = useRef<() => void>(noop);

  // Sweeps unused 3D data when the file opens, and starts the closing work before quitting and when
  // the editor closes (never in the autosave: undo could still need it). Not gated by `enabled`.
  useEffect(() => {
    engine.sweepAssets();
    const removeQuitTask = appLifecycle.onBeforeQuit(async () => {
      await finalWork(finalRef, engine);
    });
    return () => {
      removeQuitTask();
      const done = keepsRef.current() ? lastWrites(engine) : finalWork(finalRef, engine);
      closingRef.current = { engine, done };
      closedWorkRef.current = done.catch(noop);
    };
  }, [engine]);

  useEffect(() => {
    if (!enabled) return;
    // Read when the cleanup runs, on purpose: the closing work starts in the other effect's cleanup.
    const closings = closingRef;
    const closedSave = closedSaveRef;
    let maxWait: ReturnType<typeof setTimeout> | undefined;
    const run = (force = false) => {
      debounced.cancel();
      clearTimeout(maxWait);
      maxWait = undefined;
      return autosaveRef.current(force);
    };
    const debounced = debounce(() => void run(), AUTOSAVE_DELAY_MS);
    const schedule = () => {
      debounced();
      maxWait ??= setTimeout(() => void run(), AUTOSAVE_MAX_WAIT_MS);
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
      // (its closing work started) saves once that's done, even when only that work changed the
      // document (the file's change count stopped with the editor); autosave turned off saves
      // what's there. Set now, so `closed` read after this commit waits for it.
      closedSave.current = new Promise<void>((resolve) => {
        queueMicrotask(() => {
          const closing = closings.current?.engine === engine ? closings.current.done : null;
          const save = closing ? closing.then(run, () => run(true)) : run();
          void save.then(resolve, resolve);
        });
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

  const closed = useCallback(async () => {
    await Promise.all([closedWorkRef.current, closedSaveRef.current]);
  }, []);

  return useMemo(() => ({ flush, finish, closed }), [flush, finish, closed]);
}
