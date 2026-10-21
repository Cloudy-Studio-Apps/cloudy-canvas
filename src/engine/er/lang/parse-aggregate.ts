import type { DbmlError, TokenCursor } from "../../db/dbml";
import { endOfItem, parseAttribute } from "./parse-attributes";
import type { ParsedErAggregate } from "./parser.types";

/** `Aggregate Name { relation_name  attributes… }`: the first item is the boxed relation. */
export function parseAggregate(cursor: TokenCursor, warnings: DbmlError[]): ParsedErAggregate {
  const keyword = cursor.next();
  const name = cursor.expectName("an aggregation name").value;
  cursor.expectSymbol("{");
  cursor.skipNewlines();
  const relation = cursor.expectName("the relation it groups").value;
  endOfItem(cursor);
  const aggregate: ParsedErAggregate = { name, relation, attributes: [], line: keyword.line };
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return aggregate;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    aggregate.attributes.push(parseAttribute(cursor, warnings));
    endOfItem(cursor);
  }
}
