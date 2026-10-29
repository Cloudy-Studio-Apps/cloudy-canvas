import type { DbEnumElement, DbTableElement } from "../../db";
import type { CodeWarning } from "../targets/warnings.types";
import type { CodeSchema } from "./code-schema.types";

/** What `toCodeSchema` reads: the board's `DbSchema`, or anything listing tables and enums. */
export interface SchemaSource {
  tables(): DbTableElement[];
  enums(): DbEnumElement[];
}

export interface CodeSchemaResult {
  schema: CodeSchema;
  warnings: CodeWarning[];
}
