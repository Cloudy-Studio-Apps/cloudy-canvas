import { Frame } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designMcpTools, designCanvas } from "../../design-points";
import { BoxDrawTool } from "../core";
import { designStarters } from "../core/ui";
import { frameTools } from "./frame.mcp";
import { FrameKind } from "./frame.kind";
import { FrameSection } from "./ui/frame-section";
import { FramePresetsSidebar } from "./ui/frame-presets-sidebar";
import { FRAME_STARTERS } from "./ui/starters/frame-starters";
import * as frameApi from ".";
import * as frameUi from "./ui";

/**
 * Frames: the kind, the tool (F, A) with its presets sidebar (shown in the properties panel while
 * the tool is on), the frame section and the presets' agent tools.
 */
export const frameModule = defineModule({
  id: "frame",
  tier: "core",
  requires: ["core"],
  exports: { ...frameApi, ...frameUi },
  register(host) {
    const kind = new FrameKind();
    host.contribute(designCanvas.kinds, kind);
    host.contribute(designCanvas.tools, {
      id: "frame",
      create: (ctx) => new BoxDrawTool(ctx, kind),
      keys: [{ key: "f" }, { key: "a" }],
    });
    host.contribute(designCanvas.options, { framePreset: "desktop" });
    host.contribute(designMcpTools, { id: "frame", tools: () => frameTools });
    host.contribute(designStarters, ...FRAME_STARTERS);

    host.contribute(designEditor.tools, {
      tool: "frame",
      element: "frame",
      icon: Frame,
      toolbar: { group: 1, order: 10, menu: "frames" },
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
