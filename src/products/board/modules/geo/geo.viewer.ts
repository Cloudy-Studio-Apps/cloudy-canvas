import { defineModule } from "@shared/core";
import { registerGeoCanvas } from "./geo.canvas";

/** The geo module in the HTML viewer: what draws its elements, no editor. */
export const geoViewerModule = defineModule({
  id: "geo",
  tier: "feature",
  requires: ["connector"],
  register(host) {
    registerGeoCanvas(host);
  },
});
