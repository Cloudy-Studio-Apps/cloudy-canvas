import { Circle } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { EllipseKind } from "./ellipse.kind";

/** Ellipses: the kind and the tool (O), in the shapes menu. */
export const ellipseModule = defineModule({
  id: "ellipse",
  requires: ["core"],
  register(host) {
    const kind = new EllipseKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "ellipse",
      create: (ctx) => new BoxDrawTool(ctx, kind),
      keys: [{ key: "o" }],
    });
    host.contribute(designEditor.tools, {
      tool: "ellipse",
      element: "ellipse",
      icon: Circle,
      toolbar: { group: 1, order: 50, menu: "shapes" },
    });
  },
});
