import type { CodeColumn } from "../../model";

/** A column's `bsonType`, or `null` for an unknown type. */
export function bsonType(column: CodeColumn): string | null {
  switch (column.type) {
    case "integer":
    case "smallint":
      return "int";
    case "bigint":
      return "long";
    case "decimal":
      return "decimal";
    case "float":
    case "real":
      return "double";
    case "boolean":
      return "bool";
    case "varchar":
    case "char":
    case "text":
    case "uuid":
    case "time":
      return "string";
    case "date":
    case "timestamp":
    case "timestamptz":
      return "date";
    case "json":
    case "jsonb":
      return "object";
    case "blob":
      return "binData";
    default:
      return null;
  }
}
