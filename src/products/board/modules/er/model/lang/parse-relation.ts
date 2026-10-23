import { parseSettings, type DbmlError, type TokenCursor } from "../../../db/schema/dbml";
import {
  applyAttributeSetting,
  attributeNamed,
  endOfItem,
  isPrefix,
  parseAttributeBlock,
  parsePrefixes,
  unknownSetting,
} from "./parse-attributes";
import { parseCardinality } from "./parse-cardinality";
import type { RawRelation, RelationLine } from "./parser.types";

/**
 * `Relation name [identifying, id, color: #hex] { Entity.attribute (min,max) as role [arrow] |
 * attribute … }` (`.attribute`, the attribute the entity joins through, is optional).
 */
export function parseRelation(cursor: TokenCursor, warnings: DbmlError[]): RawRelation {
  const keyword = cursor.next();
  const name = cursor.expectName("a relation name").value;
  const relation: RawRelation = {
    name,
    identifying: false,
    idMark: false,
    existenceMark: false,
    associative: false,
    color: null,
    lines: [],
    line: keyword.line,
  };
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key, hasValue) => {
      if (key === "identifying") relation.identifying = true;
      else if (key === "id") relation.idMark = true;
      else if (key === "associative") relation.associative = true;
      else if (key === "existence") relation.existenceMark = true;
      else if (key === "color" && hasValue) relation.color = cursor.expectColor();
      else {
        warnings.push(unknownSetting(key, at));
        return false;
      }
      return true;
    });
  }
  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) break;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    relation.lines.push(parseLine(cursor, warnings));
    endOfItem(cursor);
  }
  return relation;
}

/** One line: a participant or an attribute; which one is decided once every name is known. */
function parseLine(cursor: TokenCursor, warnings: DbmlError[]): RelationLine {
  // `attr name` forces an attribute; `attr` alone is an attribute named "attr".
  const next = cursor.peek(1);
  const forcedAttribute =
    cursor.isKeyword("attr") &&
    (next.kind === "ident" || next.kind === "string" || isPrefix(next.value));
  if (forcedAttribute) cursor.next();
  const flags = parsePrefixes(cursor);
  const token = cursor.expectName("an entity or attribute name");
  const attribute = attributeNamed(token.value, token.line);
  flags.forEach((apply) => apply(attribute));
  const via = cursor.acceptSymbol(".") ? cursor.expectName("an attribute name").value : "";

  const line: RelationLine = {
    attribute,
    cardinality: null,
    role: "",
    arrow: false,
    via,
    forcedAttribute,
  };
  if (cursor.isSymbol("(")) line.cardinality = parseCardinality(cursor);
  if (cursor.isKeyword("as")) {
    cursor.next();
    line.role = cursor.expectName("a role name").value;
  }
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key) => {
      if (key === "arrow") line.arrow = true;
      else if (!applyAttributeSetting(attribute, key)) warnings.push(unknownSetting(key, at));
      return false;
    });
  }
  if (cursor.acceptSymbol("{")) attribute.children = parseAttributeBlock(cursor, warnings);
  return line;
}
