import { useState, useSyncExternalStore } from "react";

import type { DbEnumElement, DbSchema, DbTableElement } from "@board";
import { useBoardSchema } from "./use-board-schema";

/** Changes whenever any table, enum or DBML note on the board changes. */
export function useDbVersion(): number {
  const db = useBoardSchema();
  return useSyncExternalStore(db.subscribe, db.getVersion);
}

/**
 * Reads from the board schema and re-reads only when the schema changes or `key` does (pass a key
 * that identifies what `query` reads). The result is a read-through cache, never canvas state.
 */
export function useDbQuery<T>(query: (db: DbSchema) => T, key = ""): T {
  const db = useBoardSchema();
  const version = useDbVersion();
  const [cache, setCache] = useState(() => ({ version, key, value: query(db) }));
  if (cache.version !== version || cache.key !== key) {
    const next = { version, key, value: query(db) };
    setCache(next);
    return next.value;
  }
  return cache.value;
}

export function useDbTable(id: string): DbTableElement | undefined {
  return useDbQuery((db) => db.table(id), id);
}

export function useDbEnum(id: string): DbEnumElement | undefined {
  return useDbQuery((db) => db.enum(id), id);
}
