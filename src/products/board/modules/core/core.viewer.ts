import { defineModule } from "@shared/core";
import { registerCoreCanvas } from "./core.canvas";

/** The core module in the HTML viewer: what draws its elements, no editor. */
export const coreViewerModule = defineModule({
  id: "core",
  tier: "core",
  register(host) {
    registerCoreCanvas(host);
  },
});
