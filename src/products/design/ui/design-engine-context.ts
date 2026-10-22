import type { DesignEngine, DesignEngineState } from "@design";
import { useEngine, useEngineState } from "@canvas-ui";

/** The design's engine, typed with its tool options. Use inside a design's `EngineContext`. */
export function useDesignEngine(): DesignEngine {
  return useEngine() as DesignEngine;
}

/** `useEngineState` with the design's tool options. */
export function useDesignState<T>(selector: (state: DesignEngineState) => T): T {
  return useEngineState((state) => selector(state as DesignEngineState));
}
