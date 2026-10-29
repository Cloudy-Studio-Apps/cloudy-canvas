import { defineModule } from "@shared/core";
import { registerDrawCanvas } from "./draw.canvas";
import * as drawApi from ".";

/** The draw module in the HTML viewer: what draws its elements, no editor. */
export const drawViewerModule = defineModule({
  id: "draw",
  tier: "feature",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...drawApi },
  register(host) {
    registerDrawCanvas(host);
  },
});
