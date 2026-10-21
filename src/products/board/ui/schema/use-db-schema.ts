import { useMemo } from "react";

import { DbSchema, type BoardEngine } from "@board";

/** The database schema of the engine's document. */
export function useDbSchema(engine: BoardEngine): DbSchema {
  return useMemo(() => new DbSchema(engine.doc), [engine]);
}
