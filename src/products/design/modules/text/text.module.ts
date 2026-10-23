import { Type } from "lucide-react";

import { glyphOutliner } from "@platform";
import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas } from "../../design-points";
import { textTools } from "./text.agent-tools";
import { TEXT_DEFAULTS } from "./text.defaults";
import { TextKind } from "./text.kind";
import { TextTool } from "./text.tool";
import { TypographySection } from "./ui/typography-section";
import { useTextOutlines } from "./ui/use-text-outlines";

/**
 * Text: the kind, the tool (T), the Typography section (with the font picker) and the fonts for
 * agents (`list_fonts`).
 */
export const textModule = defineModule({
  id: "text",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new TextKind(glyphOutliner));
    host.contribute(designCanvas.tools, {
      id: "text",
      create: (ctx) => new TextTool(ctx),
      keys: [{ key: "t" }],
    });
    host.contribute(designCanvas.options, { textTypography: TEXT_DEFAULTS.typography });
    host.contribute(designAgentTools, { id: "text", tools: () => textTools });

    host.contribute(designEditor.sessionHooks, {
      id: "text-outlines",
      use: () => useTextOutlines(glyphOutliner),
    });
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
