import { defineModule } from "@shared/core";
import { registerCoreCanvas } from "./core.canvas";
import * as coreApi from ".";

/** The core module in the HTML viewer: what draws its elements, no editor. */
export const coreViewerModule = defineModule({
  id: "core",
  tier: "core",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...coreApi },
  register(host) {
    registerCoreCanvas(host);
  },
});
