import { Star } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { StarKind } from "./star.kind";
import { StarSection } from "./ui/star-section";

/** Stars: the kind and the tool, in the shapes menu, and the star section. */
export const starModule = defineModule({
  id: "star",
  requires: ["core"],
  register(host) {
    const kind = new StarKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "star",
      create: (ctx) => new BoxDrawTool(ctx, kind),
    });
    host.contribute(designEditor.tools, {
      tool: "star",
      element: "star",
      icon: Star,
      toolbar: { group: 1, order: 70, menu: "shapes" },
    });
    host.contribute(designEditor.propertySections, {
      id: "star",
      tab: "design",
      order: 16,
      when: ofType("star"),
      component: StarSection,
    });
  },
});
