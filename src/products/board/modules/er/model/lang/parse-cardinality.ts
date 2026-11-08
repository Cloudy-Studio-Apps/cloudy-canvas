import type { TokenCursor } from "../../../db";
import type { Cardinality } from "./parser.types";
import { t } from "../../er.i18n";

/** `(0,n)`, `(1,1)`, `(1:n)`, `(0,*)`. */
export function parseCardinality(cursor: TokenCursor): Cardinality {
  cursor.expectSymbol("(");
  const min = bound(cursor, t("expect.minimum"));
  if (!cursor.acceptSymbol(":")) cursor.expectSymbol(",");
  const max = bound(cursor, t("expect.maximum"));
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
  throw cursor.expected(what);
}
