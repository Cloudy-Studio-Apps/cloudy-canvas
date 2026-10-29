import { Sticker } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardMcpTools } from "../../board-points";
import { stickerTools } from "./sticker.mcp";
import { BoardStickerWheel } from "./ui/board-sticker-wheel";
import * as stickerApi from ".";
import { registerStickerCanvas } from "./sticker.canvas";

/** Stickers: the kind, the tool (K) with its picker wheel, and stamping them from agents. */
export const stickerModule = defineModule({
  id: "sticker",
  tier: "feature",
  exports: { ...stickerApi },
  register(host) {
    registerStickerCanvas(host);

    host.contribute(boardMcpTools, { id: "stickers", tools: () => stickerTools });

    host.contribute(boardEditor.tools, {
      tool: "sticker",
      element: "sticker",
      icon: Sticker,
      toolbar: { group: 1, order: 30 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "sticker", component: BoardStickerWheel });
  },
});
