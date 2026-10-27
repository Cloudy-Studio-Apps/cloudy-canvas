import type {
  ElementHandle,
  ElementInteraction,
  ElementView,
  InteractionQuery,
  Point,
} from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { ErKind } from "../base/er.kind";
import { erConnectHandles, erConnectInteraction } from "../connect";
import { drawErIsa } from "./isa.draw";
import type { ErIsaElement } from "./isa.types";
import { t } from "../er.i18n";

export class ErIsaKind extends ErKind<ErIsaElement> {
  readonly type = "er-isa";
  readonly label = t("kinds.isa.label");
  readonly description =
    'A generalization (an "is a" triangle) from a parent entity to its children.';

  /** Connect dots: drag one onto an entity to make it a child, or onto empty board for a new one. */
  override handles(el: ErIsaElement, zoom: number): ElementHandle[] {
    return erConnectHandles(zoom, (side) => this.anchor(el, side));
  }

  override interactionAt(
    el: ErIsaElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    return erConnectInteraction(el, p, query, (side) => this.anchor(el, side));
  }

  draw(view: ElementView, el: ErIsaElement): void {
    drawErIsa(view, el);
  }
}
