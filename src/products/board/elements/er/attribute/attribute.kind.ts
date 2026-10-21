import type { ElementTextStyle, ElementView, Size } from "@canvas";

import { INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { ErNamedKind } from "../base/er-named.kind";
import { attributeSize } from "../base/er-size";
import { drawErAttribute } from "./attribute.draw";
import type { ErAttributeElement } from "./attribute.types";

export class ErAttributeKind extends ErNamedKind<ErAttributeElement> {
  readonly type = "er-attribute";
  readonly label = "Attribute";
  readonly description = "An attribute of an entity, relation or aggregation in an ER diagram.";

  draw(view: ElementView, el: ErAttributeElement): void {
    drawErAttribute(view, el, this.textStyle(el));
  }

  /** Centered in the ellipse; a lollipop's name sits above its circle. */
  protected textStyle(el: ErAttributeElement): ElementTextStyle {
    return {
      fontSize: ER_DEFAULTS.fontSize,
      color: INK_COLOR,
      align: "center",
      vAlign: el.look === "lollipop" ? "top" : "middle",
      padX: 0,
      padY: 0,
    };
  }

  protected override nameSize(el: ErAttributeElement, name: string): Size {
    return attributeSize(name, el.look);
  }

  override fillDefaults(el: ErAttributeElement): ErAttributeElement {
    const filled = super.fillDefaults(el);
    return { ...filled, optional: filled.optional ?? false, look: filled.look ?? "ellipse" };
  }
}
