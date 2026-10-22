import { useService } from "@canvas-ui";
import { DB_SCHEMA, type DbSchema } from "../../schema";

/** The open board's database schema (the engine's `DB_SCHEMA` service). */
export function useBoardSchema(): DbSchema {
  return useService(DB_SCHEMA);
}
