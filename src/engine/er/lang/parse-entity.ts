import { parseSettings, type DbmlError, type TokenCursor } from "../../db/dbml";
import { parseAttributeBlock, unknownSetting } from "./parse-attributes";
import type { ParsedErEntity } from "./parser.types";

/** `Entity name [weak] { attributes }`. */
export function parseEntity(cursor: TokenCursor, warnings: DbmlError[]): ParsedErEntity {
  const keyword = cursor.next();
  const name = cursor.expectName("an entity name").value;
  let weak = false;
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key) => {
      if (key === "weak") weak = true;
      else warnings.push(unknownSetting(key, at));
      return false;
    });
  }
  cursor.expectSymbol("{");
  return { name, weak, attributes: parseAttributeBlock(cursor, warnings), line: keyword.line };
}
