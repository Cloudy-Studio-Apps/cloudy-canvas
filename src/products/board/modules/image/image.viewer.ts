import { defineModule } from "@shared/core";
import { registerImageCanvas } from "./image.canvas";

/** The image module in the HTML viewer: what draws its elements, no editor. */
export const imageViewerModule = defineModule({
  id: "image",
  tier: "core",
  register(host) {
    registerImageCanvas(host);
  },
});
