import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { SHAPE_FILLS, SHAPE_STROKES } from "../../palette";
import { GeoKind } from "./geo.kind";
import { ShapeTool } from "./shape.tool";

/** The geo module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerGeoCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new GeoKind());
  host.contribute(boardCanvas.tools, {
    id: "shape",
    create: (ctx) => new ShapeTool(ctx),
    keys: [{ key: "r" }],
  });
  host.contribute(boardCanvas.options, {
    shapeKind: "rectangle",
    shapeFill: SHAPE_FILLS[0].value,
    shapeStroke: SHAPE_STROKES[0].value,
    shapeFillToken: null,
    shapeStrokeToken: null,
  });
}
