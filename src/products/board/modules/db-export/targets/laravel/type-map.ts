import type { CodeColumn } from "../../model";

/** Blueprint column methods by type, with the arguments after the column name. */
const BLUEPRINT: Readonly<Record<string, (args: readonly number[]) => [string, number[]]>> = {
  integer: () => ["integer", []],
  bigint: () => ["bigInteger", []],
  smallint: () => ["smallInteger", []],
  decimal: (args) => ["decimal", args.slice(0, 2)],
  float: () => ["double", []],
  real: () => ["float", []],
  boolean: () => ["boolean", []],
  // 255 is Laravel's default length.
  varchar: (args) => ["string", args[0] !== undefined && args[0] !== 255 ? [args[0]] : []],
  char: (args) => ["char", args.slice(0, 1)],
  text: () => ["text", []],
  uuid: () => ["uuid", []],
  date: () => ["date", []],
  time: (args) => ["time", args.slice(0, 1)],
  timestamp: (args) => ["timestamp", args.slice(0, 1)],
  timestamptz: (args) => ["timestampTz", args.slice(0, 1)],
  json: () => ["json", []],
  jsonb: () => ["jsonb", []],
  blob: () => ["binary", []],
};

/** The Blueprint method and its extra arguments for a column, or `null` for an unknown type. */
export function blueprintMethod(column: CodeColumn): [string, number[]] | null {
  if (column.array) return ["json", []];
  return BLUEPRINT[column.type]?.(column.args) ?? null;
}

/** The cast of a column that isn't a key or a timestamp, or `null` for none. */
export function castOf(column: CodeColumn, enumClass: (name: string) => string): string | null {
  if (column.enum) return `${enumClass(column.enum)}::class`;
  if (column.array) return "'array'";
  switch (column.type) {
    case "boolean":
      return "'boolean'";
    case "integer":
    case "bigint":
    case "smallint":
      return "'integer'";
    case "float":
    case "real":
      return "'float'";
    case "decimal":
      return `'decimal:${column.args[1] ?? 0}'`;
    case "date":
      return "'date'";
    case "timestamp":
    case "timestamptz":
      return "'datetime'";
    case "json":
    case "jsonb":
      return "'array'";
    default:
      return null;
  }
}

/** Columns Eloquent manages itself. */
export const TIMESTAMP_COLUMNS = new Set(["created_at", "updated_at", "deleted_at"]);

const INTEGER_TYPES = new Set(["integer", "bigint", "smallint"]);

/** Whether a column is an integer. */
export const isInteger = (column: CodeColumn) => INTEGER_TYPES.has(column.type) && !column.array;
