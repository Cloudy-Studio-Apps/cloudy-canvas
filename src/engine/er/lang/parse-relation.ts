import { parseSettings, type DbmlError, type TokenCursor } from "../../db/dbml";
import { attributeNamed, parseAttributeTail, unknownSetting } from "./parse-attributes";
import type { RawRelation, RelationLine } from "./parser.types";

/** `Relation name [identifying] { Entity (min,max) as role | attribute … }`. */
export function parseRelation(cursor: TokenCursor, warnings: DbmlError[]): RawRelation {
  const keyword = cursor.next();
  const name = cursor.expectName("a relation name").value;
  let identifying = false;
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key) => {
      if (key === "identifying") identifying = true;
      else warnings.push(unknownSetting(key, at));
      return false;
    });
  }
  cursor.expectSymbol("{");
  const lines: RelationLine[] = [];
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) break;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    lines.push(parseLine(cursor, warnings));
    cursor.acceptSymbol(",");
    cursor.expectEndOfLine();
  }
  return { name, identifying, lines, line: keyword.line };
}

function parseLine(cursor: TokenCursor, warnings: DbmlError[]): RelationLine {
  const token = cursor.expectName("an entity or attribute name");
  const cardinality = cursor.isSymbol("(") ? parseCardinality(cursor) : null;
  let role = "";
  if (cursor.isKeyword("as")) {
    cursor.next();
    role = cursor.expectName("a role name").value;
  }
  const attribute = attributeNamed(token.value, token.line);
  if (!cardinality && !role) parseAttributeTail(cursor, attribute, warnings);
  return { attribute, cardinality, role };
}

/** `(0,n)`, `(1,1)`, `(1:n)`. */
function parseCardinality(cursor: TokenCursor): { min: string; max: string } {
  cursor.expectSymbol("(");
  const min = bound(cursor, "a minimum like 0 or 1");
  if (!cursor.acceptSymbol(":")) cursor.expectSymbol(",");
  const max = bound(cursor, "a maximum like 1 or n");
  cursor.expectSymbol(")");
  return { min, max };
}

function bound(cursor: TokenCursor, what: string): string {
  const token = cursor.peek();
  if (token.kind === "number") return cursor.next().value;
  if (token.kind === "ident" && /^[nm*]$/i.test(token.value))
    return cursor.next().value.toLowerCase();
  throw cursor.error(`Expected ${what}`);
}
