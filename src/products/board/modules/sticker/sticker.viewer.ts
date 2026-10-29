import { defineModule } from "@shared/core";
import { registerStickerCanvas } from "./sticker.canvas";
import * as stickerApi from ".";

/** The sticker module in the HTML viewer: what draws its elements, no editor. */
export const stickerViewerModule = defineModule({
  id: "sticker",
  tier: "feature",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...stickerApi },
  register(host) {
    registerStickerCanvas(host);
  },
});
