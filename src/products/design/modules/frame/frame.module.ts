import { Frame } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { FrameKind } from "./frame.kind";
import { FrameTool } from "./frame.tool";
import { FrameSection } from "./ui/frame-section";
import { FrameToolOptions } from "./ui/frame-tool-options";

/** Frames: the kind, the tool (F, A) with its size presets, and the frame section. */
export const frameModule = defineModule({
  id: "frame",
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new FrameKind());
    host.contribute(designCanvas.tools, {
      id: "frame",
      create: (ctx) => new FrameTool(ctx),
      keys: [{ key: "f" }, { key: "a" }],
    });
    host.contribute(designCanvas.options, { framePreset: "desktop" });

    host.contribute(designEditor.tools, {
      tool: "frame",
      element: "frame",
      icon: Frame,
      toolbar: { group: 1, order: 10 },
    });
    host.contribute(designEditor.toolPanels, { tool: "frame", component: FrameToolOptions });
    host.contribute(designEditor.propertySections, {
      id: "frame",
      tab: "design",
      order: 15,
      when: ({ nodes }) => nodes.length > 0 && nodes.every((node) => node.type === "frame"),
      component: FrameSection,
    });
  },
});
