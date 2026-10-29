import { defineModule } from "@shared/core";
import { registerColorsCanvas } from "./colors.canvas";

/** The colors module in the HTML viewer: what draws its elements, no editor. */
export const colorsViewerModule = defineModule({
  id: "colors",
  tier: "feature",
  register(host) {
    registerColorsCanvas(host);
  },
});
