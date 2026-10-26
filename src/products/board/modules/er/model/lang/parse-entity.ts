import { parseSettings, type DbmlError, type TokenCursor } from "../../../db";
import { parseAttributeBlock, unknownSetting } from "./parse-attributes";
import type { RawEntity } from "./parser.types";

/** `Entity name [weak, color: #hex, isa: Parent] { attributes }`; the block is optional. */
export function parseEntity(cursor: TokenCursor, warnings: DbmlError[]): RawEntity {
  const keyword = cursor.next();
  const name = cursor.expectName("an entity name").value;
  const entity: RawEntity = {
    name,
    weak: false,
    color: null,
    isa: null,
    attributes: [],
    line: keyword.line,
  };
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key, hasValue) => {
      if (key === "weak") entity.weak = true;
      else if (key === "color" && hasValue) entity.color = cursor.expectColor();
      else if (key === "isa" && hasValue) entity.isa = cursor.expectName("a parent entity").value;
      else {
        warnings.push(unknownSetting(key, at));
        return false;
      }
      return true;
    });
  }
  if (cursor.acceptSymbol("{")) entity.attributes = parseAttributeBlock(cursor, warnings);
  return entity;
}
