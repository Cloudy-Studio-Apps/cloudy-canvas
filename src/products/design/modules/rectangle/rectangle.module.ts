import { Square } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { RectangleKind } from "./rectangle.kind";
import * as rectangleApi from ".";

/**
 * Rectangles: the kind, the tool (R) and its toolbar button. Their fills, strokes and corners are
 * edited by the core module's sections, which apply to any node with those fields.
 */
export const rectangleModule = defineModule({
  id: "rectangle",
  tier: "feature",
  requires: ["core"],
  exports: { ...rectangleApi },
  register(host) {
    const kind = new RectangleKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "rectangle",
      create: (ctx) => new BoxDrawTool(ctx, kind),
      keys: [{ key: "r" }],
    });
    host.contribute(designCanvas.options, { rectangleFill: RECTANGLE_DEFAULTS.fill });

    host.contribute(designEditor.tools, {
      tool: "rectangle",
      element: "rectangle",
      icon: Square,
      toolbar: { group: 1, order: 20, menu: "shapes" },
    });
  },
});
