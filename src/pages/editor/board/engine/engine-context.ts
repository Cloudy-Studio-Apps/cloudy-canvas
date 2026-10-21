import { createContext, useContext, useSyncExternalStore } from "react";

import type { CanvasEngine, EngineState } from "@engine";

/** The mounted engine, provided by the board page to everything drawn around the canvas. */
export const EngineContext = createContext<CanvasEngine | null>(null);

export function useEngine(): CanvasEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error("useEngine must be used inside <EngineContext value={engine}>");
  return engine;
}

/**
 * Subscribes to one slice of the engine's UI state. Components only re-render when their slice
 * changes, so return primitives or values the engine keeps stable (like `options`).
 */
export function useEngineState<T>(selector: (state: EngineState) => T): T {
  const engine = useEngine();
  return useSyncExternalStore(engine.subscribe, () => selector(engine.getState()));
}
