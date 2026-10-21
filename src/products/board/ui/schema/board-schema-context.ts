import { createContext, useContext } from "react";

import type { DbSchema } from "@board";

/** The open board's database schema (see `useDbSchema`). */
export const BoardSchemaContext = createContext<DbSchema | null>(null);

export function useBoardSchema(): DbSchema {
  const schema = useContext(BoardSchemaContext);
  if (!schema) throw new Error("useBoardSchema must be used inside a board session.");
  return schema;
}
