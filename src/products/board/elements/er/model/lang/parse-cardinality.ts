import type { TokenCursor } from "../../../../modules/db/schema/dbml";
import type { Cardinality } from "./parser.types";

/** `(0,n)`, `(1,1)`, `(1:n)`, `(0,*)`. */
export function parseCardinality(cursor: TokenCursor): Cardinality {
  cursor.expectSymbol("(");
  const min = bound(cursor, "a minimum like 0 or 1");
  if (!cursor.acceptSymbol(":")) cursor.expectSymbol(",");
  const max = bound(cursor, "a maximum like 1 or n");
  cursor.expectSymbol(")");
  return { min, max };
}

export function optionalCardinality(cursor: TokenCursor): Cardinality {
  return cursor.isSymbol("(") ? parseCardinality(cursor) : { min: "", max: "" };
}

function bound(cursor: TokenCursor, what: string): string {
  const token = cursor.peek();
  if (token.kind === "number") return cursor.next().value;
  if (cursor.acceptSymbol("*")) return "n";
  if (token.kind === "ident" && /^[nm]$/i.test(token.value))
    return cursor.next().value.toLowerCase();
  throw cursor.error(`Expected ${what}`);
}
