import { defineModule } from "@shared/core";
import { registerColorsCanvas } from "./colors.canvas";
import * as colorsApi from ".";

/** The colors module in the HTML viewer: what draws its elements, no editor. */
export const colorsViewerModule = defineModule({
  id: "colors",
  tier: "feature",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...colorsApi },
  register(host) {
    registerColorsCanvas(host);
  },
});
