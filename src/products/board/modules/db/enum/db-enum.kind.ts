import type { ElementView } from "@canvas";

import { DB_CARD_DEFAULTS, DbCardKind } from "../card";
import { drawDbEnum } from "./db-enum.draw";
import type { DbEnumElement } from "./db-enum.types";
import { t } from "../db.i18n";

/** A database enum: a card with one row per value. Columns typed with it link to it. */
export class DbEnumKind extends DbCardKind<DbEnumElement> {
  readonly type = "db-enum";
  readonly label = t("enum.label");
  readonly description = t("enum.description");
  override readonly defaults = DB_CARD_DEFAULTS;

  draw(view: ElementView, el: DbEnumElement): void {
    drawDbEnum(view, el);
  }
}
