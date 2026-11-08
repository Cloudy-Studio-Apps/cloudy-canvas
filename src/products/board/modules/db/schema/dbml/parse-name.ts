import type { TokenCursor } from "./token-cursor";
import { t } from "../../db.i18n";

/** `name` or `schema.name`. */
export function parseQualifiedName(cursor: TokenCursor): string {
  let name = cursor.expectName(t("expect.name")).value;
  while (cursor.acceptSymbol(".")) name += `.${cursor.expectName(t("expect.name")).value}`;
  return name;
}
