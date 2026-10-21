import type { Shape, ShapeType } from "../../document";
import { drawConnector } from "./draw-connector";
import { drawDbTable } from "./draw-db-table";
import { drawGeo } from "./draw-geo";
import { drawSection } from "./draw-section";
import { drawSticky } from "./draw-sticky";
import { drawStroke } from "./draw-stroke";
import { drawText } from "./draw-text";
import type { ShapeView } from "./shape-view";
import type { ShapeDrawer } from "./shape-drawers.types";

/** One drawer per shape type. Adding a shape type means adding its drawer here. */
const DRAWERS: { [K in ShapeType]: ShapeDrawer<Extract<Shape, { type: K }>> } = {
  sticky: drawSticky,
  text: drawText,
  stroke: drawStroke,
  "db-table": drawDbTable,
  geo: drawGeo,
  connector: drawConnector,
  section: drawSection,
};

export function drawShape(view: ShapeView, shape: Shape): void {
  (DRAWERS[shape.type] as ShapeDrawer)(view, shape);
}
