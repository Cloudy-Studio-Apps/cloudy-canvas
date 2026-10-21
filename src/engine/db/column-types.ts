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
  "varchar(255)",
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

/** Index methods offered by the index editor. */
export const INDEX_TYPES = ["btree", "hash", "gin", "gist", "brin"] as const;
