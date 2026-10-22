import type { DbRefKind } from "../../table";
import type { TokenCursor } from "./token-cursor";
import type { ParsedEndpoint } from "./parser.types";

const REF_KINDS = new Set<string>([">", "<", "-", "<>"]);

/**
 * Parses a `[key, key: value, …]` settings list. `onSetting` receives the lowercased key
 * (multi-word keys like "not null" joined by one space) and whether a `:` value follows; it must
 * consume the value, or return `false` to have it skipped.
 */
export function parseSettings(
  cursor: TokenCursor,
  onSetting: (key: string, hasValue: boolean) => boolean,
): void {
  cursor.expectSymbol("[");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("]")) return;
    const words: string[] = [];
    while (cursor.peek().kind === "ident") words.push(cursor.next().value.toLowerCase());
    if (words.length === 0) throw cursor.error("Expected a setting");
    const hasValue = cursor.acceptSymbol(":");
    if (!onSetting(words.join(" "), hasValue) && hasValue) skipValue(cursor);
    cursor.skipNewlines();
    if (!cursor.isSymbol("]")) cursor.expectSymbol(",");
  }
}

/** A default value, kept as raw DBML (quotes and backticks included). */
export function parseValue(cursor: TokenCursor): string {
  const token = cursor.peek();
  if (cursor.isSymbol("-") && cursor.peek(1).kind === "number") {
    cursor.next();
    return `-${cursor.next().value}`;
  }
  if (
    token.kind === "string" ||
    token.kind === "expr" ||
    token.kind === "number" ||
    token.kind === "ident"
  ) {
    return cursor.next().raw;
  }
  throw cursor.error("Expected a value");
}

export function parseRefKind(cursor: TokenCursor): DbRefKind {
  const token = cursor.peek();
  if (token.kind !== "symbol" || !REF_KINDS.has(token.value)) {
    throw cursor.error("Expected a relation kind (>, <, - or <>)");
  }
  return cursor.next().value as DbRefKind;
}

/** `table.column` (or `schema.table.column`; the schema becomes part of the table name). */
export function parseEndpoint(cursor: TokenCursor): ParsedEndpoint {
  const parts = [cursor.expectName("a table name").value];
  while (cursor.acceptSymbol(".")) {
    if (cursor.isSymbol("(")) throw cursor.error("Composite refs aren't supported yet");
    parts.push(cursor.expectName("a column name").value);
  }
  if (parts.length < 2) throw cursor.error('Expected "table.column"');
  const column = parts.pop()!;
  return { table: parts.join("."), column };
}

/** Skips a setting's value up to the next `,` or `]` at the same nesting level. */
function skipValue(cursor: TokenCursor): void {
  let depth = 0;
  while (!cursor.atEnd()) {
    if (depth === 0 && (cursor.isSymbol(",") || cursor.isSymbol("]"))) return;
    const token = cursor.next();
    if (token.kind === "symbol" && (token.value === "(" || token.value === "[")) depth++;
    if (token.kind === "symbol" && (token.value === ")" || token.value === "]")) depth--;
  }
}
