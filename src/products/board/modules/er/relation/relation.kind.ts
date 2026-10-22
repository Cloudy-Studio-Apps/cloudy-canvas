import type { ElementTextStyle, ElementView, Size } from "@canvas";

import { INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { ErNamedKind } from "../base/er-named.kind";
import { relationSize } from "../base/er-size";
import { drawErRelation } from "./relation.draw";
import type { ErRelationElement } from "./relation.types";

export class ErRelationKind extends ErNamedKind<ErRelationElement> {
  readonly type = "er-relation";
  override readonly connectable = true;
  readonly label = "Relation";
  readonly description = "A relation (diamond) between entities of an ER diagram.";

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
      participants: filled.participants.map((p) => ({ ...p, arrow: p.arrow ?? false })),
    };
  }

  protected override nameSize(_el: ErRelationElement, name: string): Size {
    return relationSize(name);
  }
}
