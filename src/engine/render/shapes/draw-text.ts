import type { TextShape } from "../../document";
import type { ShapeView } from "./shape-view";

export function drawText(view: ShapeView, shape: TextShape): void {
  view.graphics.clear();
  view.setText(shape.text, { fontSize: shape.fontSize, color: shape.color });
}
