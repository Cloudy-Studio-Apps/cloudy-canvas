import { useState } from "react";

import type { ErDiagram, ErModel, ErShape, ErShapes } from "@engine";
import { useBoardPanelStore } from "@stores/board-panel-store";
import { useEngine } from "./engine-context";
import { useErVersion } from "./use-er-version";

/** The ER diagram the editor shows (an empty one until a diagram is picked). */
export function useErDiagram(): ErDiagram {
  const { er } = useEngine();
  const id = useBoardPanelStore((state) => state.erDiagram);
  return er.diagram(id ?? "");
}

/**
 * Reads from the shown ER diagram (or the board's ER model) and re-reads only when a diagram
 * changes, another one is shown or `key` changes. The result is a read-through cache, never
 * canvas state.
 */
export function useErQuery<T>(query: (diagram: ErDiagram, er: ErModel) => T, key = ""): T {
  const { er } = useEngine();
  const diagram = useErDiagram();
  const version = useErVersion();
  const cacheKey = `${diagram.id}\n${key}`;
  const [cache, setCache] = useState(() => ({
    version,
    key: cacheKey,
    value: query(diagram, er),
  }));
  if (cache.version !== version || cache.key !== cacheKey) {
    const next = { version, key: cacheKey, value: query(diagram, er) };
    setCache(next);
    return next.value;
  }
  return cache.value;
}

/** The shown diagram's shapes, by kind. */
export function useErShapes(): ErShapes {
  return useErQuery((diagram) => diagram.shapes());
}

export function useErShape(id: string): ErShape | undefined {
  return useErQuery((_, er) => er.shape(id), id);
}
