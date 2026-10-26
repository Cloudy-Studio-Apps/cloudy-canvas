import { parseSettings, type DbmlError, type TokenCursor } from "../../../db";
import { endOfItem, unknownSetting } from "./parse-attributes";
import { optionalCardinality } from "./parse-cardinality";
import type { ParsedErIsa } from "./parser.types";

/** `Isa Parent (1,1) [exclusive|overlapping, total|partial, by: tipo] { Child (0,1) … }`. */
export function parseIsa(cursor: TokenCursor, warnings: DbmlError[]): ParsedErIsa {
  const keyword = cursor.next();
  const parent = cursor.expectName("the parent entity").value;
  const { min, max } = optionalCardinality(cursor);
  const isa: ParsedErIsa = {
    parent,
    parentMin: min,
    parentMax: max,
    exclusive: false,
    total: false,
    discriminator: null,
    children: [],
    line: keyword.line,
  };
  if (cursor.isSymbol("[")) {
    const at = cursor.peek();
    parseSettings(cursor, (key, hasValue) => {
      if (key === "exclusive") isa.exclusive = true;
      else if (key === "overlapping") isa.exclusive = false;
      else if (key === "total") isa.total = true;
      else if (key === "partial") isa.total = false;
      else if (key === "by" && hasValue)
        isa.discriminator = cursor.expectName("an attribute").value;
      else {
        warnings.push(unknownSetting(key, at));
        return false;
      }
      return true;
    });
  }
  cursor.expectSymbol("{");
  for (;;) {
    cursor.skipNewlines();
    if (cursor.acceptSymbol("}")) return isa;
    if (cursor.atEnd()) throw cursor.error('Missing closing "}"');
    const token = cursor.expectName("a child entity");
    isa.children.push({ entity: token.value, ...optionalCardinality(cursor), line: token.line });
    endOfItem(cursor);
  }
}
