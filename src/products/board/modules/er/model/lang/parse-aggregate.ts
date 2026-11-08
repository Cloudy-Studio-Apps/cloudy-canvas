import type { DbmlError, TokenCursor } from "../../../db";
import { endOfItem, parseAttribute } from "./parse-attributes";
import type { ParsedErAggregate } from "./parser.types";
import { t } from "../../er.i18n";

/** `Aggregate Name { relation_name  attributes… }`: the first item is the boxed relation. */
export function parseAggregate(cursor: TokenCursor, warnings: DbmlError[]): ParsedErAggregate {
  const keyword = cursor.next();
  const name = cursor.expectName(t("expect.aggregationName")).value;
  cursor.expectSymbol("{");
  cursor.skipNewlines();
  const relation = cursor.expectName(t("expect.groupedRelation")).value;
  endOfItem(cursor);
  const aggregate: ParsedErAggregate = { name, relation, attributes: [], line: keyword.line };
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return aggregate;
    if (cursor.atEnd()) throw cursor.missingClosing("}");
    aggregate.attributes.push(parseAttribute(cursor, warnings));
    endOfItem(cursor);
  }
}
