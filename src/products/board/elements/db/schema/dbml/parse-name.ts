import type { TokenCursor } from "./token-cursor";

/** `name` or `schema.name`. */
export function parseQualifiedName(cursor: TokenCursor): string {
  let name = cursor.expectName("a name").value;
  while (cursor.acceptSymbol(".")) name += `.${cursor.expectName("a name").value}`;
  return name;
}
