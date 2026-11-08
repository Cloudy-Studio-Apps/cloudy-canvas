import type { TokenCursor } from "../../../db";
import { endOfItem } from "./parse-attributes";
import type { ParsedErUnion } from "./parser.types";
import { t } from "../../er.i18n";

/** `Union Category { Superclass … }`: one superclass per line (a trailing comma is fine). */
export function parseUnion(cursor: TokenCursor): ParsedErUnion {
  const keyword = cursor.next();
  const category = cursor.expectName(t("expect.categoryEntity")).value;
  const union: ParsedErUnion = { category, superclasses: [], line: keyword.line };
  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return union;
    if (cursor.atEnd()) throw cursor.missingClosing("}");
    const token = cursor.expectName(t("expect.superclassEntity"));
    union.superclasses.push({ entity: token.value, line: token.line });
    cursor.acceptSymbol(",");
    endOfItem(cursor);
  }
}
