import type { ElementView } from "@canvas";

import { DB_CARD_DEFAULTS, DbCardKind } from "../card";
import { drawDbEnum } from "./db-enum.draw";
import type { DbEnumElement } from "./db-enum.types";

/** A database enum: a card with one row per value. Columns typed with it link to it. */
export class DbEnumKind extends DbCardKind<DbEnumElement> {
  readonly type = "db-enum";
  readonly label = "Database enum";
  readonly description = "An enum of the board's database schema; columns use it as their type.";
  override readonly defaults = DB_CARD_DEFAULTS;

  draw(view: ElementView, el: DbEnumElement): void {
    drawDbEnum(view, el);
  }
}
