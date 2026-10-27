import type {
  ElementHandle,
  ElementInteraction,
  ElementTextStyle,
  ElementView,
  InteractionQuery,
  Point,
  Size,
} from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { erConnectHandles, erConnectInteraction } from "../connect";
import { ErNamedKind } from "../base/er-named.kind";
import { relationSize } from "../base/er-size";
import { drawErRelation } from "./relation.draw";
import type { ErRelationElement } from "./relation.types";
import { t } from "../er.i18n";

export class ErRelationKind extends ErNamedKind<ErRelationElement> {
  readonly type = "er-relation";
  override readonly connectable = true;
  readonly label = t("kinds.relation.label");
  readonly description = t("kinds.relation.description");

  /** Connect dots: drag one to link this to another element, or to add an attribute. */
  override handles(el: ErRelationElement, zoom: number): ElementHandle[] {
    return erConnectHandles(zoom, (side) => this.anchor(el, side));
  }

  override interactionAt(
    el: ErRelationElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    return erConnectInteraction(el, p, query, (side) => this.anchor(el, side));
  }

  draw(view: ElementView, el: ErRelationElement): void {
    drawErRelation(view, el, this.textStyle());
  }

  protected textStyle(): ElementTextStyle {
    return {
      fontSize: ER_DEFAULTS.fontSize,
      color: INK_COLOR,
      align: "center",
      vAlign: "middle",
      padX: 0,
      padY: 0,
    };
  }

  override fillDefaults(el: ErRelationElement): ErRelationElement {
    const filled = super.fillDefaults(el);
    return {
      ...filled,
      idMark: filled.idMark ?? false,
      existenceMark: filled.existenceMark ?? false,
      associative: filled.associative ?? false,
      participants: filled.participants.map((p) => ({
        ...p,
        arrow: p.arrow ?? false,
        via: p.via ?? "",
      })),
    };
  }

  protected override nameSize(_el: ErRelationElement, name: string): Size {
    return relationSize(name);
  }
}
