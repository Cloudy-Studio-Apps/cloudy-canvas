import { parseSettings } from "./parse-settings";
import { parseQualifiedName } from "./parse-name";
import type { TokenCursor } from "./token-cursor";
import type { ParsedNote } from "./parser.types";

/** Parses a top-level sticky note `Note name [settings] { '…' }`. The cursor is on `Note`. */
export function parseStickyNote(cursor: TokenCursor): ParsedNote {
  const keyword = cursor.next();
  const note: ParsedNote = {
    name: parseQualifiedName(cursor),
    text: "",
    headerColor: null,
    line: keyword.line,
  };
  if (cursor.isSymbol("[")) {
    parseSettings(cursor, (key, hasValue) => {
      if (key !== "headercolor" || !hasValue) return false;
      note.headerColor = cursor.expectColor();
      return true;
    });
  }
  cursor.expectSymbol("{");
  cursor.skipNewlines();
  if (!cursor.isSymbol("}")) note.text = cursor.expectString("the note text");
  cursor.skipNewlines();
  cursor.expectSymbol("}");
  return note;
}
