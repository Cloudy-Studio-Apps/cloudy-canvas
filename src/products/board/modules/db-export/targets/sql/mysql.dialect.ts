import { RESERVED } from "../../code";
import type { CodeColumn, CodeEnum, CodeIndex, CodeTable } from "../../model";
import type { SqlDialect, SqlType } from "./sql-dialect.types";
import { quoteIdentifier, sqlString } from "./sql-values";

const id = (name: string) => quoteIdentifier(name, "`", RESERVED.mysql);
const withArgs = (type: string, args: readonly number[]) =>
  args.length > 0 ? `${type}(${args.join(", ")})` : type;

const TYPES: Readonly<Record<string, (args: readonly number[]) => string>> = {
  integer: () => "INT",
  bigint: () => "BIGINT",
  smallint: () => "SMALLINT",
  decimal: (args) => withArgs("DECIMAL", args),
  float: () => "DOUBLE",
  real: () => "FLOAT",
  boolean: () => "BOOLEAN",
  varchar: (args) => withArgs("VARCHAR", args.length > 0 ? args : [255]),
  char: (args) => withArgs("CHAR", args),
  text: () => "TEXT",
  uuid: () => "CHAR(36)",
  date: () => "DATE",
  time: (args) => withArgs("TIME", args),
  timestamp: (args) => withArgs("DATETIME", args),
  timestamptz: (args) => withArgs("TIMESTAMP", args),
  json: () => "JSON",
  jsonb: () => "JSON",
  blob: () => "BLOB",
};

/** Index methods MySQL takes (`USING`); others are left to the default. */
const METHODS = new Set(["btree", "hash"]);

function columnType(column: CodeColumn, enums: readonly CodeEnum[]): SqlType {
  // MySQL has no arrays: they're JSON.
  if (column.array) return "JSON";
  if (column.enum) {
    const values = enums.find((e) => e.name === column.enum)?.values ?? [];
    return `ENUM(${values.map((v) => sqlString(v.name)).join(", ")})`;
  }
  return TYPES[column.type]?.(column.args) ?? null;
}

function index(table: CodeTable, idx: CodeIndex, name: string): string {
  const parts = [...idx.columns.map(id), ...idx.exprs.map((expr) => `(${expr})`)];
  const using = METHODS.has(idx.method.toLowerCase()) ? ` USING ${idx.method.toUpperCase()}` : "";
  const unique = idx.unique ? "UNIQUE " : "";
  return `CREATE ${unique}INDEX ${id(name)} ON ${id(table.name)} (${parts.join(", ")})${using};`;
}

/** MySQL: inline enums, `AUTO_INCREMENT`, inline comments, expression defaults in parentheses. */
export const mysqlDialect: SqlDialect = {
  name: "MySQL",
  id,
  columnType,
  fallbackType: "TEXT",
  increment: "AUTO_INCREMENT",
  enumType: () => null,
  defaultValue: (value) => {
    switch (value.kind) {
      case "string":
        return sqlString(value.value);
      case "boolean":
        return value.value.toUpperCase();
      case "null":
        return "NULL";
      case "number":
        return value.value;
      case "expr":
        return /^now\(\)$|^current_timestamp(\(\))?$/i.test(value.value)
          ? "CURRENT_TIMESTAMP"
          : `(${value.value})`;
    }
  },
  columnComment: (note) => `COMMENT ${sqlString(note)}`,
  comments: () => [],
  tableSuffix: (table) => (table.note ? ` COMMENT = ${sqlString(table.note)}` : ""),
  indexMethods: METHODS,
  index,
};
