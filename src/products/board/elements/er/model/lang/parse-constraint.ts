import type { TokenCursor } from "../../../../modules/db/schema/dbml";
import type { ErConstraintRule } from "../../constraint/constraint.types";
import { optionalCardinality } from "./parse-cardinality";
import type { ParsedErConstraint } from "./parser.types";

const KINDS = new Set<string>(["exclusive", "inclusive", "exclusion", "inclusion"]);
/** Kinds about one entity's part in two relations. */
const WITH_ENTITY = new Set<string>(["exclusive", "inclusive"]);

/**
 * `Constraint exclusive Entity: r1, r2`, `Constraint inclusive Entity (2,n): r1 -> r2`,
 * `Constraint exclusion: r1, r2`, `Constraint inclusion: r1 -> r2`.
 */
export function parseConstraint(cursor: TokenCursor): ParsedErConstraint {
  const keyword = cursor.next();
  const kindToken = cursor.peek();
  const kind = kindToken.kind === "ident" ? kindToken.value.toLowerCase() : "";
  if (!KINDS.has(kind)) throw cursor.error("Expected exclusive, inclusive, exclusion or inclusion");
  cursor.next();
  let entity = "";
  let cardinality = { min: "", max: "" };
  if (WITH_ENTITY.has(kind)) {
    entity = cursor.expectName("an entity").value;
    if (kind === "inclusive") cardinality = optionalCardinality(cursor);
  }
  cursor.expectSymbol(":");
  const from = cursor.expectName("a relation").value;
  if (cursor.acceptSymbol("-")) cursor.expectSymbol(">");
  else cursor.expectSymbol(",");
  const to = cursor.expectName("a relation").value;
  if (!cursor.atEnd()) cursor.expectEndOfLine();
  return {
    kind: kind as ErConstraintRule,
    entity,
    from,
    to,
    ...cardinality,
    line: keyword.line,
  };
}
