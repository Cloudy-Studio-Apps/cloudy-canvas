import { defineModule } from "@shared/core";
import { registerStickyCanvas } from "./sticky.canvas";
import * as stickyApi from ".";

/** The sticky module in the HTML viewer: what draws its elements, no editor. */
export const stickyViewerModule = defineModule({
  id: "sticky",
  tier: "feature",
  requires: ["connector"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...stickyApi },
  register(host) {
    registerStickyCanvas(host);
  },
});
