import type { TokenCursor } from "../../../db";
import type { ErConstraintRule } from "../../constraint/constraint.types";
import { optionalCardinality } from "./parse-cardinality";
import type { ParsedErConstraint } from "./parser.types";
import { t } from "../../er.i18n";

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
  if (!KINDS.has(kind)) throw cursor.error(t("parse.expectedConstraintKind"));
  cursor.next();
  let entity = "";
  let cardinality = { min: "", max: "" };
  if (WITH_ENTITY.has(kind)) {
    entity = cursor.expectName(t("expect.entity")).value;
    if (kind === "inclusive") cardinality = optionalCardinality(cursor);
  }
  cursor.expectSymbol(":");
  const from = cursor.expectName(t("expect.relation")).value;
  if (cursor.acceptSymbol("-")) cursor.expectSymbol(">");
  else cursor.expectSymbol(",");
  const to = cursor.expectName(t("expect.relation")).value;
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
