import {
  ER_AGGREGATE_TITLE_H,
  ER_FONT_SIZE,
  ER_STROKE_WIDTH,
  INK_COLOR,
  type ErAggregateShape,
} from "../../document";
import { centerTextTop } from "./center-text";
import type { ShapeView } from "./shape-view";

const TITLE_PADDING_X = 8;

/** An aggregation: a box round its relation and participants, with its name at the top left. */
export function drawErAggregate(view: ShapeView, shape: ErAggregateShape): void {
  const { w, h } = shape;
  view.graphics
    .clear()
    .rect(0, 0, w, h)
    .stroke({ color: INK_COLOR, width: ER_STROKE_WIDTH * 1.5, alignment: 1 });
  view
    .setText(shape.name, { fontSize: ER_FONT_SIZE - 1, color: INK_COLOR, fontWeight: "600" })
    .position.set(TITLE_PADDING_X, centerTextTop(ER_AGGREGATE_TITLE_H, ER_FONT_SIZE - 1));
}
