import { defineModule } from "@shared/core";
import { registerSectionCanvas } from "./section.canvas";
import * as sectionApi from ".";

/** The section module in the HTML viewer: what draws its elements, no editor. */
export const sectionViewerModule = defineModule({
  id: "section",
  tier: "feature",
  uses: ["sticky"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...sectionApi },
  register(host) {
    registerSectionCanvas(host);
  },
});
