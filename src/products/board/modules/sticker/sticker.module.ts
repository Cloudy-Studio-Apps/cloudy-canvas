import { Sticker } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardAgentTools, boardCanvas } from "../../board-points";
import { stickerTools } from "./sticker.agent-tools";
import { StickerKind } from "./sticker.kind";
import { StickerTool } from "./sticker.tool";
import { StickerWheel } from "./ui/sticker-picker";

/** Stickers: the kind, the tool (K) with its picker wheel, and stamping them from agents. */
export const stickerModule = defineModule({
  id: "sticker",
  register(host) {
    host.contribute(boardCanvas.kinds, new StickerKind());
    host.contribute(boardCanvas.tools, {
      id: "sticker",
      create: (ctx) => new StickerTool(ctx),
      keys: [{ key: "k" }],
    });
    host.contribute(boardCanvas.options, { sticker: null });
    host.contribute(boardAgentTools, { id: "stickers", tools: () => stickerTools });

    host.contribute(boardEditor.tools, {
      tool: "sticker",
      element: "sticker",
      icon: Sticker,
      toolbar: { group: 1, order: 30 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "sticker", component: StickerWheel });
  },
});
