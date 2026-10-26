import { Triangle } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { PolygonKind } from "./polygon.kind";
import { PolygonSection } from "./ui/polygon-section";

/** Polygons: the kind and the tool, in the shapes menu, and the sides section. */
export const polygonModule = defineModule({
  id: "polygon",
  tier: "feature",
  requires: ["core"],
  register(host) {
    const kind = new PolygonKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "polygon",
      create: (ctx) => new BoxDrawTool(ctx, kind),
    });
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
      when: ofType("polygon"),
      component: PolygonSection,
    });
  },
});
