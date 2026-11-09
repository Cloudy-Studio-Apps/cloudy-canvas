import type { CanvasEngine } from "@canvas";
import type { FinalWork } from "./use-canvas-autosave.types";

/** Runs `work` and resolves to whether it changed the engine's document. */
async function changesFrom<O extends object>(
  engine: CanvasEngine<O>,
  work: () => Promise<void>,
): Promise<boolean> {
  let changed = false;
  const stop = engine.doc.onChange(() => {
    changed = true;
  });
  try {
    await work();
  } finally {
    stop();
  }
  return changed;
}

/**
 * The engine's last writes (`engine.finishBeforeSave`: a live 3D edit writing itself), for an
 * editor that goes while its document stays (its tab drops to `document`): no sweep, since the
 * undo history still lives and may need the assets. Resolves to whether it changed the document.
 */
export function lastWrites<O extends object>(engine: CanvasEngine<O>): Promise<boolean> {
  return changesFrom(engine, () => engine.finishBeforeSave());
}

/**
 * The final work for a document about to go (the tab closing or hibernating, the window
 * quitting): the engine's last writes, then the sweep of the unused assets. Resolves to whether it
 * changed the document. Runs once per engine: quitting and closing share it, and the closing save
 * awaits it whichever started it.
 */
export function finalWork<O extends object>(
  ref: { current: FinalWork | null },
  engine: CanvasEngine<O>,
): Promise<boolean> {
  if (ref.current?.engine === engine) return ref.current.done;
  const done = changesFrom(engine, async () => {
    await engine.finishBeforeSave();
    engine.sweepAssets();
  });
  ref.current = { engine, done };
  return done;
}
