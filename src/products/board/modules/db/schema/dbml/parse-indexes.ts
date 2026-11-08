import { unsupported } from "./dbml-error";
import { parseSettings } from "./parse-settings";
import type { TokenCursor } from "./token-cursor";
import type { DbmlError, ParsedIndex, ParsedIndexPart } from "./parser.types";
import { t } from "../../db.i18n";

/** Parses an `indexes { … }` block inside a table. The cursor is on the `indexes` keyword. */
export function parseIndexes(cursor: TokenCursor, warnings: DbmlError[]): ParsedIndex[] {
  cursor.next();
  cursor.expectSymbol("{");
  const indexes: ParsedIndex[] = [];
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return indexes;
    if (cursor.atEnd()) throw cursor.error(t("syntax.missingIndexesBrace"));
    indexes.push(parseIndex(cursor, warnings));
    cursor.expectEndOfLine();
  }
}

/** `col`, `` `expr` `` or `(a, `expr`, …)`, then optional settings. */
function parseIndex(cursor: TokenCursor, warnings: DbmlError[]): ParsedIndex {
  const start = cursor.peek();
  const parts: ParsedIndexPart[] = [];
  if (cursor.acceptSymbol("(")) {
    do parts.push(parsePart(cursor));
    while (cursor.acceptSymbol(","));
    cursor.expectSymbol(")");
  } else {
    parts.push(parsePart(cursor));
  }

  const index: ParsedIndex = {
    parts,
    pk: false,
    unique: false,
    name: "",
    type: "",
    note: "",
    line: start.line,
  };
  if (!cursor.isSymbol("[")) return index;
  parseSettings(cursor, (key, hasValue) => {
    if (!hasValue && key === "pk") index.pk = true;
    else if (!hasValue && key === "unique") index.unique = true;
    else if (hasValue && key === "name") index.name = cursor.expectString(t("expect.indexName"));
    else if (hasValue && key === "note") index.note = cursor.expectString(t("expect.note"));
    else if (hasValue && key === "type")
      index.type = cursor.expectName(t("expect.indexType")).value;
    else {
      warnings.push(unsupported(t("dbml.indexSetting", { key }), start));
      return false;
    }
    return true;
  });
  return index;
}

function parsePart(cursor: TokenCursor): ParsedIndexPart {
  const token = cursor.peek();
  if (token.kind === "expr") return { kind: "expr", expr: cursor.next().value };
  return { kind: "column", column: cursor.expectName(t("expect.indexColumn")).value };
}
