import { useState, useSyncExternalStore } from "react";

import type { CanvasEngine } from "@engine";
import { useEngine } from "./engine-context";

/** Changes whenever the board content changes. */
export function useContentVersion(): number {
  const engine = useEngine();
  return useSyncExternalStore(engine.subscribeContent, engine.getContentVersion);
}

/**
 * Reads from the engine and re-reads only when the board content changes. A read-through cache
 * for views that list content (never a copy of canvas state kept in React).
 */
export function useContentQuery<T>(query: (engine: CanvasEngine) => T): T {
  const engine = useEngine();
  const version = useContentVersion();
  const [cache, setCache] = useState(() => ({ version, value: query(engine) }));
  if (cache.version !== version) {
    const next = { version, value: query(engine) };
    setCache(next);
    return next.value;
  }
  return cache.value;
}
