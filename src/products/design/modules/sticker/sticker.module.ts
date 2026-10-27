import { Sticker } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designMcpTools, designCanvas } from "../../design-points";
import { stickerAgentTools } from "./sticker.mcp";
import { StickerNodeKind } from "./sticker.kind";
import { pasteForeignSticker } from "./sticker-paste";
import { DesignStickerTool } from "./sticker.tool";
import { DesignStickerWheel } from "./ui/design-sticker-wheel";
import { StickerSection } from "./ui/sticker-section";
import { useStickerCommands } from "./ui/use-sticker-commands";
import { t } from "./sticker.i18n";

/**
 * Stickers on designs: the kind, the tool (Shift+K; K is Scale) with the shared picker wheel,
 * the Sticker section (edge color, outline, Convert to vectors), the command and agent tools.
 */
export const stickerModule = defineModule({
  id: "sticker",
  tier: "feature",
  requires: ["core", "group", "vector"],
  register(host) {
    host.contribute(designCanvas.kinds, new StickerNodeKind());
    host.contribute(designCanvas.tools, {
      id: "sticker",
      create: (ctx) => new DesignStickerTool(ctx),
      keys: [{ key: "k", shift: true }],
    });
    host.contribute(designCanvas.options, { sticker: null });
    host.contribute(designCanvas.pasteForeign, pasteForeignSticker);
    host.contribute(designCanvas.hostCommands, {
      id: "stickerToVectors",
      label: t("commands.toVectors"),
    });
    host.contribute(designMcpTools, { id: "sticker", tools: () => stickerAgentTools });

    host.contribute(designEditor.tools, {
      tool: "sticker",
      element: "sticker",
      icon: Sticker,
      toolbar: { group: 1, order: 85 },
    });
    host.contribute(designEditor.toolPanels, { tool: "sticker", component: DesignStickerWheel });
    host.contribute(designEditor.propertySections, {
      id: "sticker",
      tab: "design",
      order: 16,
      when: ofType("sticker"),
      component: StickerSection,
    });
    host.contribute(designEditor.layerIcons, { type: "sticker", icon: Sticker });
    host.contribute(designEditor.sessionHooks, { id: "sticker-commands", use: useStickerCommands });
    host.contribute(designEditor.contextMenu, {
      id: "sticker",
      menu: "selection",
      items: [
        {
          command: "stickerToVectors",
          label: t("commands.toVectors"),
          enabled: (_context, engine) =>
            engine
              .elements()
              .some((el) => el.type === "sticker" && engine.selectedIds().includes(el.id)),
        },
      ],
    });
  },
});
