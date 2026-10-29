import { Shapes } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { ShapeOptions } from "./ui/shape-options";
import * as geoApi from ".";
import { registerGeoCanvas } from "./geo.canvas";

/** Shapes: the kind (its variants register themselves), the shape tool (R) and its panel. */
export const geoModule = defineModule({
  id: "geo",
  tier: "feature",
  // Shapes drag connectors out of their sides.
  requires: ["connector"],
  exports: { ...geoApi },
  register(host) {
    registerGeoCanvas(host);

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
