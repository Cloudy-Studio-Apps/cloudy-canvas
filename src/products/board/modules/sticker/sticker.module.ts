import { Sticker } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardMcpTools, boardCanvas } from "../../board-points";
import { stickerTools } from "./sticker.mcp";
import { StickerKind } from "./sticker.kind";
import { pasteForeignSticker } from "./sticker-paste";
import { StickerTool } from "./sticker.tool";
import { BoardStickerWheel } from "./ui/board-sticker-wheel";
import * as stickerApi from ".";

/** Stickers: the kind, the tool (K) with its picker wheel, and stamping them from agents. */
export const stickerModule = defineModule({
  id: "sticker",
  tier: "feature",
  exports: { ...stickerApi },
  register(host) {
    host.contribute(boardCanvas.kinds, new StickerKind());
    host.contribute(boardCanvas.tools, {
      id: "sticker",
      create: (ctx) => new StickerTool(ctx),
      keys: [{ key: "k" }],
    });
    host.contribute(boardCanvas.options, { sticker: null });
    host.contribute(boardCanvas.pasteForeign, pasteForeignSticker);
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
