import { useState, useSyncExternalStore } from "react";

import type { DbSchema, DbTableShape } from "@engine";
import { useEngine } from "./engine-context";

/** Changes whenever any database table on the board changes. */
export function useDbVersion(): number {
  const { db } = useEngine();
  return useSyncExternalStore(db.subscribe, db.getVersion);
}

/**
 * Reads from the board schema and re-reads only when the schema changes or `key` does (pass a key
 * that identifies what `query` reads). The result is a read-through cache, never canvas state.
 */
export function useDbQuery<T>(query: (db: DbSchema) => T, key = ""): T {
  const { db } = useEngine();
  const version = useDbVersion();
  const [cache, setCache] = useState(() => ({ version, key, value: query(db) }));
  if (cache.version !== version || cache.key !== key) {
    const next = { version, key, value: query(db) };
    setCache(next);
    return next.value;
  }
  return cache.value;
}

export function useDbTable(id: string): DbTableShape | undefined {
  return useDbQuery((db) => db.table(id), id);
}
