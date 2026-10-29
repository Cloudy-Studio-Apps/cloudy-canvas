import type { CodeColumn } from "../../../model";
import type { NestProvider } from "../nestjs-provider.types";
import type { TypeormType } from "./typeorm-type-map.types";

/** A column's TypeORM type for the provider, or `null` for an unknown type. */
export function typeormType(column: CodeColumn, provider: NestProvider): TypeormType | null {
  const pg = provider === "postgresql";
  const [a, b] = column.args;
  const length = a !== undefined ? [`length: ${a}`] : [];
  const precision = a !== undefined ? [`precision: ${a}`] : [];
  switch (column.type) {
    case "integer":
      return { db: pg ? "integer" : "int", ts: "number", extra: [] };
    case "bigint":
      // The driver returns bigints as strings.
      return { db: "bigint", ts: "string", extra: [] };
    case "smallint":
      return { db: "smallint", ts: "number", extra: [] };
    case "decimal":
      return {
        db: "decimal",
        ts: "string",
        extra: [...precision, ...(b !== undefined ? [`scale: ${b}`] : [])],
      };
    case "float":
      return { db: pg ? "double precision" : "double", ts: "number", extra: [] };
    case "real":
      return { db: pg ? "real" : "float", ts: "number", extra: [] };
    case "boolean":
      return { db: "boolean", ts: "boolean", extra: [] };
    case "varchar":
      return { db: "varchar", ts: "string", extra: length };
    case "char":
      return { db: "char", ts: "string", extra: length };
    case "text":
      return { db: "text", ts: "string", extra: [] };
    case "uuid":
      return { db: pg ? "uuid" : "char", ts: "string", extra: pg ? [] : ["length: 36"] };
    case "date":
      return { db: "date", ts: "string", extra: [] };
    case "time":
      return { db: "time", ts: "string", extra: precision };
    case "timestamp":
      return { db: pg ? "timestamp" : "datetime", ts: "Date", extra: precision };
    case "timestamptz":
      return { db: pg ? "timestamptz" : "timestamp", ts: "Date", extra: precision };
    case "json":
      return { db: "json", ts: "Record<string, unknown>", extra: [] };
    case "jsonb":
      return { db: pg ? "jsonb" : "json", ts: "Record<string, unknown>", extra: [] };
    case "blob":
      return { db: pg ? "bytea" : "blob", ts: "Buffer", extra: [] };
    default:
      return null;
  }
}
