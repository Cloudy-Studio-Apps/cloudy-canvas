import type { ElementTextStyle, ElementView, Size } from "@canvas";

import { INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { ErNamedKind } from "../base/er-named.kind";
import { entitySize } from "../base/er-size";
import { drawErEntity } from "./entity.draw";
import type { ErEntityElement } from "./entity.types";

export class ErEntityKind extends ErNamedKind<ErEntityElement> {
  readonly type = "er-entity";
  override readonly connectable = true;
  readonly label = "Entity";
  readonly description = "An entity of an ER diagram; click to start a new diagram.";

  draw(view: ElementView, el: ErEntityElement): void {
    drawErEntity(view, el, this.textStyle());
  }

  protected textStyle(): ElementTextStyle {
    return {
      fontSize: ER_DEFAULTS.fontSize,
      color: INK_COLOR,
      fontWeight: "600",
      align: "center",
      vAlign: "middle",
      padX: 0,
      padY: 0,
    };
  }

  protected override nameSize(_el: ErEntityElement, name: string): Size {
    return entitySize(name);
  }
}
