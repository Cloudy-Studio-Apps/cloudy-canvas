import { defineModule } from "@shared/core";
import { registerImageCanvas } from "./image.canvas";
import * as imageApi from ".";

/** The image module in the HTML viewer: what draws its elements, no editor. */
export const imageViewerModule = defineModule({
  id: "image",
  tier: "core",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...imageApi },
  register(host) {
    registerImageCanvas(host);
  },
});
