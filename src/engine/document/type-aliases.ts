/**
 * Every built-in column type and its common aliases (lower-case, single spaces) → the one name the
 * board uses. Identity entries make upper-case spellings (`VARCHAR`) normalize too.
 */
const TYPE_ALIASES: Readonly<Record<string, string>> = {
  integer: "integer",
  int: "integer",
  int4: "integer",
  bigint: "bigint",
  int8: "bigint",
  smallint: "smallint",
  int2: "smallint",
  serial: "serial",
  serial4: "serial",
  bigserial: "bigserial",
  serial8: "bigserial",
  decimal: "decimal",
  numeric: "decimal",
  float: "float",
  float8: "float",
  double: "float",
  "double precision": "float",
  real: "real",
  float4: "real",
  boolean: "boolean",
  bool: "boolean",
  varchar: "varchar",
  "character varying": "varchar",
  char: "char",
  character: "char",
  bpchar: "char",
  text: "text",
  uuid: "uuid",
  date: "date",
  time: "time",
  "time without time zone": "time",
  timestamp: "timestamp",
  "timestamp without time zone": "timestamp",
  timestamptz: "timestamptz",
  "timestamp with time zone": "timestamptz",
  json: "json",
  jsonb: "jsonb",
  blob: "blob",
};

/** `INT` → `integer`, `bool[]` → `boolean[]`. Custom types and enums are returned unchanged. */
export function canonicalTypeName(name: string): string {
  const array = name.endsWith("[]");
  const base = array ? name.slice(0, -2) : name;
  const canonical = TYPE_ALIASES[base.trim().toLowerCase().replace(/\s+/g, " ")];
  if (!canonical) return name;
  return array ? `${canonical}[]` : canonical;
}
