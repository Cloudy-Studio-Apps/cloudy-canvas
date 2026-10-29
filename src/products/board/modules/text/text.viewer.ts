import { defineModule } from "@shared/core";
import { registerTextCanvas } from "./text.canvas";
import * as textApi from ".";

/** The text module in the HTML viewer: what draws its elements, no editor. */
export const textViewerModule = defineModule({
  id: "text",
  tier: "core",
  after: ["embed"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...textApi },
  register(host) {
    registerTextCanvas(host);
  },
});
