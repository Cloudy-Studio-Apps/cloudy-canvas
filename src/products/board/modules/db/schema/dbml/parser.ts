import { DbmlSyntaxError, unsupported } from "./dbml-error";
import { parseEndpoint, parseRefKind, parseSettings } from "./parse-settings";
import { parseEnum } from "./parse-enum";
import { parseQualifiedName } from "./parse-name";
import { parseStickyNote } from "./parse-sticky-note";
import { parseTable } from "./parse-table";
import { TokenCursor } from "./token-cursor";
import { tokenize } from "./tokenizer";
import type { DbmlError, ParsedRef, ParsedSchema, ParseResult } from "./parser.types";

/** Blocks that are valid DBML but not supported on the board yet; they're skipped with a warning. */
const UNSUPPORTED_BLOCKS: Record<string, string> = {
  tablegroup: "TableGroup",
  project: "Project",
  tablepartial: "TablePartial",
  records: "Records",
};

/** Parses the supported DBML subset. Returns the first syntax error instead of throwing. */
export function parseDbml(source: string): ParseResult {
  try {
    return { ok: true, schema: parseSchema(new TokenCursor(tokenize(source))) };
  } catch (error) {
    if (error instanceof DbmlSyntaxError) return { ok: false, error: error.toError() };
    throw error;
  }
}

function parseSchema(cursor: TokenCursor): ParsedSchema {
  const schema: ParsedSchema = { tables: [], enums: [], notes: [], refs: [], warnings: [] };
  for (;;) {
    cursor.skipNewlines();
    if (cursor.atEnd()) return schema;
    const token = cursor.peek();
    const keyword = token.kind === "ident" ? token.value.toLowerCase() : "";

    if (keyword === "table") {
      schema.tables.push(parseTable(cursor, schema.refs, schema.warnings));
    } else if (keyword === "enum") {
      schema.enums.push(parseEnum(cursor, schema.warnings));
    } else if (keyword === "note") {
      schema.notes.push(parseStickyNote(cursor));
    } else if (keyword === "ref") {
      parseRef(cursor, schema.refs, schema.warnings);
    } else if (keyword in UNSUPPORTED_BLOCKS) {
      cursor.next();
      schema.warnings.push(unsupported(UNSUPPORTED_BLOCKS[keyword]!, token));
      while (!cursor.isSymbol("{")) {
        if (cursor.atEnd()) throw cursor.error('Expected "{"');
        cursor.next();
      }
      cursor.skipBlock();
    } else {
      throw cursor.error("Expected Table, Enum, Ref or Note");
    }
  }
}

/** `Ref [name]: a.x > b.y [settings]` or `Ref [name] { a.x > b.y [settings] }`. */
function parseRef(cursor: TokenCursor, refs: ParsedRef[], warnings: DbmlError[]): void {
  const keyword = cursor.next();
  if (!cursor.isSymbol(":") && !cursor.isSymbol("{")) parseQualifiedName(cursor);
  const block = cursor.acceptSymbol("{");
  if (!block) cursor.expectSymbol(":");
  if (block) cursor.skipNewlines();

  try {
    const from = parseEndpoint(cursor);
    const kind = parseRefKind(cursor);
    const to = parseEndpoint(cursor);
    refs.push({ from, to, kind, line: keyword.line });
  } catch (error) {
    if (!(error instanceof DbmlSyntaxError) || !error.message.startsWith("Composite")) throw error;
    warnings.push(unsupported("Composite ref", keyword));
    while (!cursor.atEnd() && cursor.peek().kind !== "newline" && !cursor.isSymbol("}"))
      cursor.next();
  }
  if (cursor.isSymbol("[")) {
    parseSettings(cursor, (key) => {
      warnings.push(unsupported(`Ref setting "${key}"`, keyword));
      return false;
    });
  }
  if (block) {
    cursor.skipNewlines();
    cursor.expectSymbol("}");
  }
}
