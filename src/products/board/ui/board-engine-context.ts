import type { BoardEngine, BoardEngineState } from "@board";
import { useEngine, useEngineState } from "@canvas-ui";

/** The board's engine, typed with the board's tool options. Use inside a board's `EngineContext`. */
export function useBoardEngine(): BoardEngine {
  return useEngine() as BoardEngine;
}

/** `useEngineState` with the board's tool options. */
export function useBoardState<T>(selector: (state: BoardEngineState) => T): T {
  return useEngineState((state) => selector(state as BoardEngineState));
}
