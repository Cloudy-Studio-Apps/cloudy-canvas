import { SquareDashed } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { SectionKind } from "./section.kind";

/** Sections: the kind and its tool (Shift+S), in the frame menu. */
export const sectionModule = defineModule({
  id: "section",
  requires: ["frame"],
  register(host) {
    const kind = new SectionKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "section",
      create: (ctx) => new BoxDrawTool(ctx, kind),
      keys: [{ key: "s", shift: true }],
    });
    host.contribute(designEditor.tools, {
      tool: "section",
      element: "section",
      icon: SquareDashed,
      toolbar: { group: 1, order: 12, menu: "frames" },
    });
  },
});
