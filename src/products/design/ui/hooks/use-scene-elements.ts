import { useCallback, useSyncExternalStore } from "react";

import type { CanvasElement } from "@canvas";
import { useDesignEngine } from "../design-engine-context";

/**
 * The scene's elements (the page on screen, bottom to top), re-read when the document changes:
 * the same array until it does.
 */
export function useSceneElements(): readonly CanvasElement[] {
  const engine = useDesignEngine();
  const subscribe = useCallback((listener: () => void) => engine.onViewChange(listener), [engine]);
  // The scene's list is replaced on every document change and kept otherwise.
  return useSyncExternalStore(subscribe, () => engine.elements());
}
