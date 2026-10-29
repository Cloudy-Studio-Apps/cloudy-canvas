import type { CodeColumn } from "../../model";
import type { TsType } from "./type-map.types";

const NUMBER = new Set(["integer", "bigint", "smallint", "float", "real"]);
const STRING = new Set(["varchar", "char", "text", "uuid"]);
const DATE = new Set(["date", "time", "timestamp", "timestamptz"]);

/** The TypeScript type of a column's JSON value, or `null` for an unknown type. */
export function tsType(column: CodeColumn, enumType: (name: string) => string): TsType | null {
  const base = baseType(column, enumType);
  if (!base) return null;
  return column.array ? { ...base, type: `${base.type}[]` } : base;
}

function baseType(column: CodeColumn, enumType: (name: string) => string): TsType | null {
  if (column.enum) return { type: enumType(column.enum), comment: "" };
  if (NUMBER.has(column.type)) return { type: "number", comment: "" };
  if (STRING.has(column.type)) return { type: "string", comment: "" };
  if (column.type === "boolean") return { type: "boolean", comment: "" };
  // JSON keeps decimals exact only as strings.
  if (column.type === "decimal") {
    const args = column.args.length > 0 ? `(${column.args.join(", ")})` : "";
    return { type: "string", comment: `decimal${args}` };
  }
  if (DATE.has(column.type)) return { type: "string", comment: `ISO 8601 ${column.type}` };
  if (column.type === "json" || column.type === "jsonb") return { type: "unknown", comment: "" };
  if (column.type === "blob") return { type: "string", comment: "base64" };
  return null;
}
