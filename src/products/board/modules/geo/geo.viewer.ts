import { defineModule } from "@shared/core";
import { registerGeoCanvas } from "./geo.canvas";
import * as geoApi from ".";

/** The geo module in the HTML viewer: what draws its elements, no editor. */
export const geoViewerModule = defineModule({
  id: "geo",
  tier: "feature",
  requires: ["connector"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...geoApi },
  register(host) {
    registerGeoCanvas(host);
  },
});
