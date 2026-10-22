import { Star } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { StarKind } from "./star.kind";
import { StarTool } from "./star.tool";
import { StarSection } from "./ui/star-section";

/** Stars: the kind and the tool, in the shapes menu, and the star section. */
export const starModule = defineModule({
  id: "star",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new StarKind());
    host.contribute(designCanvas.tools, { id: "star", create: (ctx) => new StarTool(ctx) });
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
      when: ({ nodes }) => nodes.length > 0 && nodes.every((node) => node.type === "star"),
      component: StarSection,
    });
  },
});
