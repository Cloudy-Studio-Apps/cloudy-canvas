import { Frame } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { FrameKind } from "./frame.kind";
import { FrameSection } from "./ui/frame-section";
import { FramePresetsSidebar } from "./ui/frame-presets-sidebar";

/**
 * Frames: the kind, the tool (F, A) with its presets sidebar (shown in the properties panel while
 * the tool is on), and the frame section.
 */
export const frameModule = defineModule({
  id: "frame",
  requires: ["core"],
  register(host) {
    const kind = new FrameKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "frame",
      create: (ctx) => new BoxDrawTool(ctx, kind),
      keys: [{ key: "f" }, { key: "a" }],
    });
    host.contribute(designCanvas.options, { framePreset: "desktop" });

    host.contribute(designEditor.tools, {
      tool: "frame",
      element: "frame",
      icon: Frame,
      toolbar: { group: 1, order: 10 },
    });
    host.contribute(designEditor.toolSidebars, { tool: "frame", component: FramePresetsSidebar });
    host.contribute(designEditor.propertySections, {
      id: "frame",
      tab: "design",
      order: 15,
      when: ofType("frame"),
      component: FrameSection,
    });
  },
});
