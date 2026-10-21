import type { StrokeShape } from "../../document";
import { strokeOutline } from "../stroke-outline";
import type { ShapeView } from "./shape-view";

export function drawStroke(view: ShapeView, shape: StrokeShape): void {
  const outline = strokeOutline(shape.points, shape.size, true);
  view.graphics.clear();
  if (outline.length >= 6) view.graphics.poly(outline).fill({ color: shape.color });
}
