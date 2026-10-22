import { Shapes } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { SHAPE_FILLS, SHAPE_STROKES } from "../../palette";
import { GeoKind } from "./geo.kind";
import { ShapeTool } from "./shape.tool";
import { ShapeOptions } from "./ui/shape-options";

/** Shapes: the kind (its variants register themselves), the shape tool (R) and its panel. */
export const geoModule = defineModule({
  id: "geo",
  // Shapes drag connectors out of their sides.
  requires: ["connector"],
  register(host) {
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
    });

    host.contribute(boardEditor.tools, {
      tool: "shape",
      element: "geo",
      icon: Shapes,
      toolbar: { group: 1, order: 50 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "shape", component: ShapeOptions });
    host.contribute(boardEditor.selectionPanels, { type: "geo", component: ShapeOptions });
  },
});
