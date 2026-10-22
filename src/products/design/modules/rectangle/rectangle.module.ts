import { Square } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { RECTANGLE_DEFAULTS } from "./rectangle.defaults";
import { RectangleKind } from "./rectangle.kind";
import { RectangleTool } from "./rectangle.tool";

/**
 * Rectangles: the kind, the tool (R) and its toolbar button. Their fills, strokes and corners are
 * edited by the core module's sections, which apply to any node with those fields.
 */
export const rectangleModule = defineModule({
  id: "rectangle",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new RectangleKind());
    host.contribute(designCanvas.tools, {
      id: "rectangle",
      create: (ctx) => new RectangleTool(ctx),
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
