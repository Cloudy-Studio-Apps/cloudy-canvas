import { parseSettings, type DbmlError, type TokenCursor } from "../../../db";
import type { ParsedErAttribute } from "./parser.types";
import { t } from "../../er.i18n";

/** Short prefixes: `*dni` key, `~num` partial key, `+tfno` multivalued, `/edad` derived. */
const PREFIXES: Record<string, (attribute: ParsedErAttribute) => void> = {
  "*": (a) => (a.key = "pk"),
  "~": (a) => (a.key = "partial"),
  "+": (a) => (a.multivalued = true),
  "/": (a) => (a.derived = true),
};

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
    endOfItem(cursor);
  }
}

/** `*name [pk, multi, derived, partial, optional] { parts }`; all but the name is optional. */
export function parseAttribute(cursor: TokenCursor, warnings: DbmlError[]): ParsedErAttribute {
  const flags = parsePrefixes(cursor);
  const token = cursor.expectName("an attribute name");
  const attribute = attributeNamed(token.value, token.line);
  flags.forEach((apply) => apply(attribute));
  parseAttributeTail(cursor, attribute, warnings);
  return attribute;
}

export function isPrefix(symbol: string): boolean {
  return symbol in PREFIXES;
}

export function parsePrefixes(cursor: TokenCursor): ((a: ParsedErAttribute) => void)[] {
  const flags: ((a: ParsedErAttribute) => void)[] = [];
  for (;;) {
    const token = cursor.peek();
    const apply = token.kind === "symbol" ? PREFIXES[token.value] : undefined;
    if (!apply) return flags;
    cursor.next();
    flags.push(apply);
  }
}

export function attributeNamed(name: string, line: number): ParsedErAttribute {
  return {
    name,
    key: "none",
    multivalued: false,
    derived: false,
    optional: false,
    children: [],
    line,
  };
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
      if (!applyAttributeSetting(attribute, key)) warnings.push(unknownSetting(key, at));
      return false;
    });
  }
  if (cursor.acceptSymbol("{")) attribute.children = parseAttributeBlock(cursor, warnings);
}

/** Applies one attribute setting; returns whether the key is one. */
export function applyAttributeSetting(attribute: ParsedErAttribute, key: string): boolean {
  if (key === "pk" || key === "key") attribute.key = "pk";
  else if (key === "partial") attribute.key = "partial";
  else if (key === "ak" || key === "alternate") attribute.key = "alternate";
  else if (key === "multi" || key === "multivalued") attribute.multivalued = true;
  else if (key === "derived") attribute.derived = true;
  else if (key === "optional") attribute.optional = true;
  else return false;
  return true;
}

export function isPlain(attribute: ParsedErAttribute): boolean {
  return (
    attribute.key === "none" &&
    !attribute.multivalued &&
    !attribute.derived &&
    !attribute.optional &&
    attribute.children.length === 0
  );
}

export function unknownSetting(key: string, at: { line: number; column: number }): DbmlError {
  return { message: t("lang.unknownSetting", { key }), line: at.line, column: at.column };
}

/** Items are one per line; a trailing comma is allowed. */
export function endOfItem(cursor: TokenCursor): void {
  cursor.acceptSymbol(",");
  cursor.expectEndOfLine();
}
