import type { CodeColumn } from "../../../model";
import type { NestProvider } from "../nestjs-provider.types";

/** A Prisma scalar type and its native type attribute (`@db.VarChar(255)`), if any. */
export function prismaType(
  column: CodeColumn,
  provider: NestProvider,
): { type: string; native: string } | null {
  const [a, b] = column.args;
  const pg = provider === "postgresql";
  const args = (...values: (number | undefined)[]) => {
    const given = values.filter((v): v is number => v !== undefined);
    return given.length > 0 ? `(${given.join(", ")})` : "";
  };
  switch (column.type) {
    case "integer":
      return { type: "Int", native: "" };
    case "bigint":
      return { type: "BigInt", native: "" };
    case "smallint":
      return { type: "Int", native: "@db.SmallInt" };
    case "decimal":
      return { type: "Decimal", native: a !== undefined ? `@db.Decimal${args(a, b ?? 0)}` : "" };
    case "float":
      return { type: "Float", native: "" };
    case "real":
      return { type: "Float", native: pg ? "@db.Real" : "@db.Float" };
    case "boolean":
      return { type: "Boolean", native: "" };
    case "varchar":
      return { type: "String", native: `@db.VarChar${args(a ?? (pg ? undefined : 255))}` };
    case "char":
      return { type: "String", native: `@db.Char${args(a)}` };
    case "text":
      return { type: "String", native: pg ? "" : "@db.Text" };
    case "uuid":
      return { type: "String", native: pg ? "@db.Uuid" : "@db.Char(36)" };
    case "date":
      return { type: "DateTime", native: "@db.Date" };
    case "time":
      return { type: "DateTime", native: `@db.Time${args(a)}` };
    case "timestamp":
      return {
        type: "DateTime",
        native: pg ? `@db.Timestamp${args(a)}` : `@db.DateTime${args(a)}`,
      };
    case "timestamptz":
      return {
        type: "DateTime",
        native: pg ? `@db.Timestamptz${args(a)}` : `@db.Timestamp${args(a)}`,
      };
    case "json":
      return { type: "Json", native: pg ? "@db.Json" : "" };
    case "jsonb":
      return { type: "Json", native: "" };
    case "blob":
      return { type: "Bytes", native: "" };
    default:
      return null;
  }
}
