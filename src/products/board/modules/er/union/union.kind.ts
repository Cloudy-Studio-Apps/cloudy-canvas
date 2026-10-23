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
import { drawErUnion } from "./union.draw";
import type { ErUnionElement } from "./union.types";

export class ErUnionKind extends ErKind<ErUnionElement> {
  readonly type = "er-union";
  readonly label = "Union type";
  readonly description =
    "A category: an entity whose instances are each one of its superclasses' (a U circle).";

  /** Connect dots: drag one onto an entity to make it a superclass. */
  override handles(el: ErUnionElement, zoom: number): ElementHandle[] {
    return erConnectHandles(zoom, (side) => this.anchor(el, side));
  }

  override interactionAt(
    el: ErUnionElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    return erConnectInteraction(el, p, query, (side) => this.anchor(el, side));
  }

  draw(view: ElementView, el: ErUnionElement): void {
    drawErUnion(view, el);
  }
}
