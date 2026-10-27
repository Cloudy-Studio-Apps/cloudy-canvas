import { unsupported } from "./dbml-error";
import { parseSettings } from "./parse-settings";
import { parseQualifiedName } from "./parse-name";
import type { TokenCursor } from "./token-cursor";
import type { DbmlError, ParsedEnum } from "./parser.types";
import { t } from "../../db.i18n";

/** Parses `Enum name [settings] { value [note: '…'] … }`. The cursor is on the `Enum` keyword. */
export function parseEnum(cursor: TokenCursor, warnings: DbmlError[]): ParsedEnum {
  const keyword = cursor.next();
  const result: ParsedEnum = {
    name: parseQualifiedName(cursor),
    headerColor: null,
    values: [],
    line: keyword.line,
  };
  if (cursor.isSymbol("[")) {
    parseSettings(cursor, (key, hasValue) => {
      if (key === "headercolor" && hasValue) {
        result.headerColor = cursor.expectColor();
        return true;
      }
      warnings.push(unsupported(t("dbml.enumSetting", { key }), keyword));
      return false;
    });
  }

  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return result;
    if (cursor.atEnd()) throw cursor.error(`Missing "}" for enum "${result.name}"`);
    const name = cursor.expectName("an enum value").value;
    let note = "";
    if (cursor.isSymbol("[")) {
      parseSettings(cursor, (key, hasValue) => {
        if (key === "note" && hasValue) {
          note = cursor.expectString("a note");
          return true;
        }
        warnings.push(unsupported(t("dbml.enumValueSetting", { key }), keyword));
        return false;
      });
    }
    result.values.push({ name, note });
    cursor.expectEndOfLine();
  }
}
