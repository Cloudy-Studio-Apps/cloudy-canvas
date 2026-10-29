import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { StickerKind } from "./sticker.kind";
import { pasteForeignSticker } from "./sticker-paste";
import { StickerTool } from "./sticker.tool";

/** The sticker module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerStickerCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new StickerKind());
  host.contribute(boardCanvas.tools, {
    id: "sticker",
    create: (ctx) => new StickerTool(ctx),
    keys: [{ key: "k" }],
  });
  host.contribute(boardCanvas.options, { sticker: null });
  host.contribute(boardCanvas.pasteForeign, pasteForeignSticker);
}
