import { Triangle } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { PolygonKind } from "./polygon.kind";
import { PolygonTool } from "./polygon.tool";
import { PolygonSection } from "./ui/polygon-section";

/** Polygons: the kind and the tool, in the shapes menu, and the sides section. */
export const polygonModule = defineModule({
  id: "polygon",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new PolygonKind());
    host.contribute(designCanvas.tools, { id: "polygon", create: (ctx) => new PolygonTool(ctx) });
    host.contribute(designEditor.tools, {
      tool: "polygon",
      element: "polygon",
      icon: Triangle,
      toolbar: { group: 1, order: 60, menu: "shapes" },
    });
    host.contribute(designEditor.propertySections, {
      id: "polygon",
      tab: "design",
      order: 16,
      when: ({ nodes }) => nodes.length > 0 && nodes.every((node) => node.type === "polygon"),
      component: PolygonSection,
    });
  },
});
