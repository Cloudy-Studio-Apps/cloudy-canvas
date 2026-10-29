import { defineModule } from "@shared/core";
import { registerStickyCanvas } from "./sticky.canvas";

/** The sticky module in the HTML viewer: what draws its elements, no editor. */
export const stickyViewerModule = defineModule({
  id: "sticky",
  tier: "feature",
  requires: ["connector"],
  register(host) {
    registerStickyCanvas(host);
  },
});
