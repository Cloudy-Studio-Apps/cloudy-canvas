import type { Shape, ShapeType } from "../../document";
import { drawConnector } from "./draw-connector";
import { drawDbEnum } from "./draw-db-enum";
import { drawDbTable } from "./draw-db-table";
import { drawErAggregate } from "./draw-er-aggregate";
import { drawErAttribute } from "./draw-er-attribute";
import { drawErConstraint } from "./draw-er-constraint";
import { drawErEntity } from "./draw-er-entity";
import { drawErIsa } from "./draw-er-isa";
import { drawErRelation } from "./draw-er-relation";
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
  "db-enum": drawDbEnum,
  geo: drawGeo,
  connector: drawConnector,
  section: drawSection,
  "er-entity": drawErEntity,
  "er-relation": drawErRelation,
  "er-attribute": drawErAttribute,
  "er-isa": drawErIsa,
  "er-aggregate": drawErAggregate,
  "er-constraint": drawErConstraint,
};

export function drawShape(view: ShapeView, shape: Shape): void {
  (DRAWERS[shape.type] as ShapeDrawer)(view, shape);
}
