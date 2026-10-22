import { Type } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { TEXT_DEFAULTS } from "./text.defaults";
import { TextKind } from "./text.kind";
import { TextTool } from "./text.tool";
import { TypographySection } from "./ui/typography-section";

/** Text: the kind, the tool (T) and the Typography section (with the font picker). */
export const textModule = defineModule({
  id: "text",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new TextKind());
    host.contribute(designCanvas.tools, {
      id: "text",
      create: (ctx) => new TextTool(ctx),
      keys: [{ key: "t" }],
    });
    host.contribute(designCanvas.options, { textTypography: TEXT_DEFAULTS.typography });

    host.contribute(designEditor.tools, {
      tool: "text",
      element: "text",
      icon: Type,
      toolbar: { group: 1, order: 80 },
    });
    host.contribute(designEditor.propertySections, {
      id: "typography",
      tab: "design",
      order: 16,
      when: ofType("text"),
      component: TypographySection,
    });
  },
});
