import type { TokenCursor } from "../../../db/schema/dbml";
import { endOfItem } from "./parse-attributes";
import type { ParsedErUnion } from "./parser.types";

/** `Union Category { Superclass … }`: one superclass per line (a trailing comma is fine). */
export function parseUnion(cursor: TokenCursor): ParsedErUnion {
  const keyword = cursor.next();
  const category = cursor.expectName("the category entity").value;
  const union: ParsedErUnion = { category, superclasses: [], line: keyword.line };
  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return union;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    const token = cursor.expectName("a superclass entity");
    union.superclasses.push({ entity: token.value, line: token.line });
    cursor.acceptSymbol(",");
    endOfItem(cursor);
  }
}
