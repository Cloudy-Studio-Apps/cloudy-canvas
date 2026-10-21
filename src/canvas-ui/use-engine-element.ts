import { useCallback, useSyncExternalStore } from "react";

import type { CanvasElement } from "@canvas";
import { useEngine } from "./engine-context";

/**
 * An element as the scene sees it, re-read whenever the view changes (document edits, undo).
 * The scene keeps each element object until it changes, so this only re-renders when it does.
 */
export function useEngineElement(id: string | null): CanvasElement | undefined {
  const engine = useEngine();
  const subscribe = useCallback((listener: () => void) => engine.onViewChange(listener), [engine]);
  return useSyncExternalStore(subscribe, () => (id ? engine.getElement(id) : undefined));
}
