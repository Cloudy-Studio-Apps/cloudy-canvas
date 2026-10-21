import { useState } from "react";

import type { ErModel, ErShape, ErShapes } from "@engine";
import { useEngine } from "./engine-context";
import { useErVersion } from "./use-er-version";

/**
 * Reads from the board's ER diagram and re-reads only when the diagram changes or `key` does.
 * The result is a read-through cache, never canvas state.
 */
export function useErQuery<T>(query: (er: ErModel) => T, key = ""): T {
  const { er } = useEngine();
  const version = useErVersion();
  const [cache, setCache] = useState(() => ({ version, key, value: query(er) }));
  if (cache.version !== version || cache.key !== key) {
    const next = { version, key, value: query(er) };
    setCache(next);
    return next.value;
  }
  return cache.value;
}

export function useErShapes(): ErShapes {
  return useErQuery((er) => er.shapes());
}

export function useErShape(id: string): ErShape | undefined {
  return useErQuery((er) => er.shape(id), id);
}
