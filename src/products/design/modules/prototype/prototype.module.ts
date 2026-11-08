import { defineModule } from "@shared/core";
import { registerPrototypeCanvas } from "./prototype.canvas";
import * as prototypeApi from ".";
import * as prototypeUi from "./ui";

/**
 * Prototype: how a design's screens (a page's top-level frames) link up and play, in the
 * Prototype mode. The interactions on nodes, the flow records and their pruning when screens or
 * pages are deleted.
 */
export const prototypeModule = defineModule({
  id: "prototype",
  tier: "feature",
  requires: ["core", "pages", "frame"],
  exports: { ...prototypeApi, ...prototypeUi },
  register(host) {
    registerPrototypeCanvas(host);
  },
});
