import type { TypeArgsSpec } from "./column-types.types";
import { t } from "../db.i18n";

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
  varchar: { label: t("typeArgs.length"), initial: "255" },
  char: { label: t("typeArgs.length"), initial: "1" },
  decimal: { label: t("typeArgs.precisionScale"), initial: "10, 2" },
  float: { label: t("typeArgs.precision"), initial: "" },
  time: { label: t("typeArgs.precision"), initial: "" },
  timestamp: { label: t("typeArgs.precision"), initial: "" },
  timestamptz: { label: t("typeArgs.precision"), initial: "" },
};

/** Index methods offered by the index editor. */
export const INDEX_TYPES = ["btree", "hash", "gin", "gist", "brin"] as const;
