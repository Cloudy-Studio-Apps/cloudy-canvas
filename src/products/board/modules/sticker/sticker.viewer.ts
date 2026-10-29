import { defineModule } from "@shared/core";
import { registerStickerCanvas } from "./sticker.canvas";

/** The sticker module in the HTML viewer: what draws its elements, no editor. */
export const stickerViewerModule = defineModule({
  id: "sticker",
  tier: "feature",
  register(host) {
    registerStickerCanvas(host);
  },
});
