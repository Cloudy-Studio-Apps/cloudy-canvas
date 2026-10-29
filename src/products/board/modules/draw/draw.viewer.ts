import { defineModule } from "@shared/core";
import { registerDrawCanvas } from "./draw.canvas";

/** The draw module in the HTML viewer: what draws its elements, no editor. */
export const drawViewerModule = defineModule({
  id: "draw",
  tier: "feature",
  register(host) {
    registerDrawCanvas(host);
  },
});
