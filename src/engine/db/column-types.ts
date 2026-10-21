import type { TypeArgsSpec } from "./column-types.types";

/** Built-in column types offered by the type picker; any other type can still be typed. */
export const COLUMN_TYPES = [
  "integer",
  "bigint",
  "smallint",
  "serial",
  "decimal",
  "float",
  "boolean",
  "varchar",
  "char",
  "text",
  "uuid",
  "date",
  "time",
  "timestamp",
  "timestamptz",
  "json",
  "jsonb",
  "blob",
] as const;

/**
 * Built-in types that take arguments: what the arguments mean (the input's placeholder) and the
 * value a column gets when it switches to the type.
 */
export const TYPE_ARGS: Readonly<Record<string, TypeArgsSpec>> = {
  varchar: { label: "length", initial: "255" },
  char: { label: "length", initial: "1" },
  decimal: { label: "precision, scale", initial: "10, 2" },
  float: { label: "precision", initial: "" },
  time: { label: "precision", initial: "" },
  timestamp: { label: "precision", initial: "" },
  timestamptz: { label: "precision", initial: "" },
};

/** Index methods offered by the index editor. */
export const INDEX_TYPES = ["btree", "hash", "gin", "gist", "brin"] as const;
