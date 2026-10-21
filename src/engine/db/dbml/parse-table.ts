import { unsupported } from "./dbml-error";
import type { TokenCursor } from "./token-cursor";
import { parseEndpoint, parseRefKind, parseSettings, parseValue } from "./parse-settings";
import type { DbmlError, ParsedColumn, ParsedRef, ParsedTable } from "./parser.types";

/** Parses `Table name [as alias] [settings] { … }`. The cursor is on the `Table` keyword. */
export function parseTable(
  cursor: TokenCursor,
  refs: ParsedRef[],
  warnings: DbmlError[],
): ParsedTable {
  const keyword = cursor.next();
  const table: ParsedTable = {
    name: parseQualifiedName(cursor),
    alias: null,
    headerColor: null,
    note: "",
    columns: [],
    line: keyword.line,
  };
  if (cursor.isKeyword("as")) {
    cursor.next();
    table.alias = cursor.expectName("an alias").value;
  }
  if (cursor.isSymbol("[")) {
    parseSettings(cursor, (key, hasValue) => {
      if (key === "headercolor" && hasValue) {
        const token = cursor.peek();
        if (token.kind !== "color") throw cursor.error("Expected a color like #cfe4f8");
        table.headerColor = cursor.next().value;
        return true;
      }
      if (key === "note" && hasValue) {
        table.note = cursor.expectString("a note");
        return true;
      }
      warnings.push(unsupported(`Table setting "${key}"`, keyword));
      return false;
    });
  }

  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) break;
    if (cursor.atEnd()) throw cursor.error(`Missing "}" for table "${table.name}"`);

    if (cursor.isKeyword("note") && (cursor.isSymbol(":", 1) || cursor.isSymbol("{", 1))) {
      table.note = parseNote(cursor);
    } else if (cursor.isKeyword("indexes") && cursor.isSymbol("{", 1)) {
      warnings.push(unsupported("Indexes", cursor.next()));
      cursor.skipBlock();
    } else {
      table.columns.push(parseColumn(cursor, table.name, refs, warnings));
    }
    endOfLine(cursor);
  }
  return table;
}

function parseColumn(
  cursor: TokenCursor,
  tableName: string,
  refs: ParsedRef[],
  warnings: DbmlError[],
): ParsedColumn {
  const nameToken = cursor.expectName("a column name");
  const column: ParsedColumn = {
    name: nameToken.value,
    type: parseType(cursor),
    pk: false,
    increment: false,
    notNull: false,
    unique: false,
    default: null,
    note: "",
  };
  if (!cursor.isSymbol("[")) return column;

  parseSettings(cursor, (key, hasValue) => {
    if (!hasValue) {
      if (key === "pk" || key === "primary key") column.pk = true;
      else if (key === "increment") column.increment = true;
      else if (key === "not null") column.notNull = true;
      else if (key === "null") column.notNull = false;
      else if (key === "unique") column.unique = true;
      else warnings.push(unsupported(`Column setting "${key}"`, nameToken));
      return true;
    }
    if (key === "default") {
      column.default = parseValue(cursor);
      return true;
    }
    if (key === "note") {
      column.note = cursor.expectString("a note");
      return true;
    }
    if (key === "ref") {
      const line = cursor.peek().line;
      const kind = parseRefKind(cursor);
      const to = parseEndpoint(cursor);
      refs.push({ from: { table: tableName, column: column.name }, to, kind, line });
      return true;
    }
    warnings.push(unsupported(`Column setting "${key}"`, nameToken));
    return false;
  });
  return column;
}

/** A column type: `int`, `varchar(255)`, `decimal(10, 2)`, `int[]`, `"timestamp with time zone"`. */
function parseType(cursor: TokenCursor): string {
  const first = cursor.expectName("a column type");
  let type = first.value;
  while (cursor.isSymbol(".") && cursor.peek(1).kind === "ident") {
    cursor.next();
    type += `.${cursor.next().value}`;
  }
  if (cursor.isSymbol("(")) {
    const args: string[] = [];
    cursor.next();
    while (!cursor.acceptSymbol(")")) {
      const token = cursor.next();
      if (token.kind === "eof" || token.kind === "newline")
        throw cursor.error('Missing ")"', token);
      args.push(token.raw);
    }
    type += `(${args.join("")})`;
  }
  if (cursor.isSymbol("[") && cursor.isSymbol("]", 1)) {
    cursor.next();
    cursor.next();
    type += "[]";
  }
  return type;
}

/** `Note: '…'` or `Note { '…' }`. */
export function parseNote(cursor: TokenCursor): string {
  cursor.next();
  if (cursor.acceptSymbol(":")) return cursor.expectString("a note");
  cursor.expectSymbol("{");
  cursor.skipNewlines();
  const note = cursor.expectString("a note");
  cursor.skipNewlines();
  cursor.expectSymbol("}");
  return note;
}

/** `name` or `schema.name`. */
export function parseQualifiedName(cursor: TokenCursor): string {
  let name = cursor.expectName("a name").value;
  while (cursor.acceptSymbol(".")) name += `.${cursor.expectName("a name").value}`;
  return name;
}

function endOfLine(cursor: TokenCursor): void {
  if (cursor.peek().kind === "newline" || cursor.isSymbol("}")) return;
  throw cursor.error("Expected the end of the line");
}
