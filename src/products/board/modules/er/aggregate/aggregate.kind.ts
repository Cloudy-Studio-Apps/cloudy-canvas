import {
  centerTextTop,
  rectContainsPoint,
  type ElementTextStyle,
  type ElementView,
  type Point,
} from "@canvas";

import { INK_COLOR } from "../../../palette";
import { ER_DEFAULTS } from "../base/er.defaults";
import { ErNamedKind } from "../base/er-named.kind";
import { drawErAggregate } from "./aggregate.draw";
import type { ErAggregateElement } from "./aggregate.types";
import { t } from "../er.i18n";

/** How close to the border counts as grabbing the box, in world units. */
const BORDER_REACH = 2;
const TITLE_FONT_SIZE = ER_DEFAULTS.fontSize - 1;

/**
 * An aggregation box. Its bounds follow its relation and participants (see `resolveErElements`),
 * it sits behind them like a frame and it's grabbed by its name strip or border only, so clicks
 * inside reach what it holds.
 */
export class ErAggregateKind extends ErNamedKind<ErAggregateElement> {
  readonly type = "er-aggregate";
  readonly label = t("kinds.aggregate.label");
  readonly description = t("kinds.aggregate.description");
  override readonly frame = true;

  draw(view: ElementView, el: ErAggregateElement): void {
    drawErAggregate(view, el, this.textStyle());
  }

  protected textStyle(): ElementTextStyle {
    return {
      fontSize: TITLE_FONT_SIZE,
      color: INK_COLOR,
      fontWeight: "600",
      align: "left",
      vAlign: "top",
      padX: 8,
      padY: centerTextTop(ER_DEFAULTS.aggregateTitleHeight, TITLE_FONT_SIZE),
    };
  }

  override hitTest(el: ErAggregateElement, p: Point, tolerance: number): boolean {
    const title = { x: el.x, y: el.y, w: el.w, h: ER_DEFAULTS.aggregateTitleHeight };
    if (rectContainsPoint(title, p, tolerance)) return true;
    const band = tolerance + BORDER_REACH;
    const inner =
      p.x > el.x + band &&
      p.x < el.x + el.w - band &&
      p.y > el.y + band &&
      p.y < el.y + el.h - band;
    return super.hitTest(el, p, band) && !inner;
  }
}
