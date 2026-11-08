import type { CodeColumn } from "../../model";
import type { JavaType } from "./java-type-map.types";

/** A column's Java type (without `List<…>` for arrays), or `null` for an unknown type. */
export function javaType(column: CodeColumn, enumType: (name: string) => string): JavaType | null {
  if (column.enum) return { boxed: enumType(column.enum), primitive: null, kind: "enum" };
  switch (column.type) {
    case "integer":
      return { boxed: "Integer", primitive: "int", kind: "int" };
    case "bigint":
      return { boxed: "Long", primitive: "long", kind: "long" };
    case "smallint":
      return { boxed: "Short", primitive: "short", kind: "short" };
    case "decimal":
      return { boxed: "BigDecimal", primitive: null, kind: "decimal" };
    case "float":
      return { boxed: "Double", primitive: "double", kind: "double" };
    case "real":
      return { boxed: "Float", primitive: "float", kind: "float" };
    case "boolean":
      return { boxed: "Boolean", primitive: "boolean", kind: "boolean" };
    case "varchar":
    case "char":
    case "text":
      return { boxed: "String", primitive: null, kind: "string" };
    case "uuid":
      return { boxed: "UUID", primitive: null, kind: "uuid" };
    case "date":
      return { boxed: "LocalDate", primitive: null, kind: "temporal" };
    case "time":
      return { boxed: "LocalTime", primitive: null, kind: "temporal" };
    case "timestamp":
      return { boxed: "LocalDateTime", primitive: null, kind: "temporal" };
    case "timestamptz":
      return { boxed: "OffsetDateTime", primitive: null, kind: "temporal" };
    case "json":
    case "jsonb":
      return { boxed: "Map<String, Object>", primitive: null, kind: "json" };
    case "blob":
      return { boxed: "byte[]", primitive: null, kind: "bytes" };
    default:
      return null;
  }
}
