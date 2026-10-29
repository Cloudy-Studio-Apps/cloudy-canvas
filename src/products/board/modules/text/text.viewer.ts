import { defineModule } from "@shared/core";
import { registerTextCanvas } from "./text.canvas";

/** The text module in the HTML viewer: what draws its elements, no editor. */
export const textViewerModule = defineModule({
  id: "text",
  tier: "core",
  after: ["embed"],
  register(host) {
    registerTextCanvas(host);
  },
});
