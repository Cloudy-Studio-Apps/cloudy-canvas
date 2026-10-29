import { defineModule } from "@shared/core";
import { registerSectionCanvas } from "./section.canvas";

/** The section module in the HTML viewer: what draws its elements, no editor. */
export const sectionViewerModule = defineModule({
  id: "section",
  tier: "feature",
  uses: ["sticky"],
  register(host) {
    registerSectionCanvas(host);
  },
});
