import type { CodeSchema, CodeTable } from "../model";
import type { CodeRequest } from "./code-target.types";

/** The tables a request writes: the one table in single mode, else every table. */
export function focusTables(schema: CodeSchema, request: CodeRequest): CodeTable[] {
  if (request.mode !== "single") return schema.tables;
  return schema.tables.filter((table) => table.name === request.table).slice(0, 1);
}
