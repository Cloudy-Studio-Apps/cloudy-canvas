import { Type } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { TextOptions } from "./ui/text-options";
import * as textApi from ".";
import { registerTextCanvas } from "./text.canvas";

/**
 * Free text: the kind, the tool (T) and its panel (size, style, alignment, color), and pasting
 * text, which takes any text the others leave.
 */
export const textModule = defineModule({
  id: "text",
  tier: "core",
  // A pasted link is a card before it's text.
  after: ["embed"],
  exports: { ...textApi },
  register(host) {
    registerTextCanvas(host);

    host.contribute(boardEditor.tools, {
      tool: "text",
      element: "text",
      icon: Type,
      toolbar: { group: 1, order: 40 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "text", component: TextOptions });
    host.contribute(boardEditor.selectionPanels, { type: "text", component: TextOptions });
  },
});
