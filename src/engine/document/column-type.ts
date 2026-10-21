import type { ColumnType } from "./column-type.types";
import { canonicalTypeName } from "./type-aliases";

const WITH_ARGS = /^(.*?)\s*\(([^()]*)\)\s*(\[\])?$/;

/**
 * `varchar(255)` → `varchar` + `255`; `decimal(10,2)[]` → `decimal[]` + `10, 2`. Aliases take the
 * board's name: `INT(11)` → `integer` + `11`.
 */
export function splitColumnType(text: string): ColumnType {
  const trimmed = text.trim();
  const match = WITH_ARGS.exec(trimmed);
  if (!match?.[1]) return { type: canonicalTypeName(trimmed), typeArgs: "" };
  return {
    type: canonicalTypeName(match[1] + (match[3] ?? "")),
    typeArgs: normalizeTypeArgs(match[2] ?? ""),
  };
}

/** Trims each argument and separates them with `, `. Surrounding parentheses are dropped. */
export function normalizeTypeArgs(args: string): string {
  const inner = args.trim().replace(/^\((.*)\)$/, "$1");
  return inner
    .split(",")
    .map((arg) => arg.trim())
    .filter(Boolean)
    .join(", ");
}

/** The full type as written in DBML: `varchar(255)`, `int[]`, `decimal(10, 2)[]`. */
export function formatColumnType({ type, typeArgs }: ColumnType): string {
  if (!typeArgs) return type;
  const array = type.endsWith("[]");
  const base = array ? type.slice(0, -2) : type;
  return `${base}(${typeArgs})${array ? "[]" : ""}`;
}
