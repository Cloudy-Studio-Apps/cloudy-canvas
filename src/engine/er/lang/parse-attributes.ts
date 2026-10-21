import { parseSettings, type DbmlError, type TokenCursor } from "../../db/dbml";
import type { ParsedErAttribute } from "./parser.types";

/** Lines of a `{ … }` block, each one an attribute; `}` is consumed. */
export function parseAttributeBlock(
  cursor: TokenCursor,
  warnings: DbmlError[],
): ParsedErAttribute[] {
  const attributes: ParsedErAttribute[] = [];
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return attributes;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    attributes.push(parseAttribute(cursor, warnings));
    cursor.acceptSymbol(",");
    cursor.expectEndOfLine();
  }
}

/** `name [pk, multi, derived, partial] { parts }`; the settings and parts are optional. */
export function parseAttribute(cursor: TokenCursor, warnings: DbmlError[]): ParsedErAttribute {
  const token = cursor.expectName("an attribute name");
  const attribute = attributeNamed(token.value, token.line);
  parseAttributeTail(cursor, attribute, warnings);
  return attribute;
}

export function attributeNamed(name: string, line: number): ParsedErAttribute {
  return { name, key: "none", multivalued: false, derived: false, children: [], line };
}

/** Settings and composite parts after an attribute's name. */
export function parseAttributeTail(
  cursor: TokenCursor,
  attribute: ParsedErAttribute,
  warnings: DbmlError[],
): void {
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key) => {
      if (key === "pk" || key === "key") attribute.key = "pk";
      else if (key === "partial") attribute.key = "partial";
      else if (key === "multi" || key === "multivalued") attribute.multivalued = true;
      else if (key === "derived") attribute.derived = true;
      else warnings.push(unknownSetting(key, at));
      return false;
    });
  }
  if (cursor.acceptSymbol("{")) attribute.children = parseAttributeBlock(cursor, warnings);
}

export function unknownSetting(key: string, at: { line: number; column: number }): DbmlError {
  return { message: `Unknown setting "${key}" was ignored`, line: at.line, column: at.column };
}
