import { defineModule } from "@shared/core";
import { registerConnectorCanvas } from "./connector.canvas";

/** The connector module in the HTML viewer: what draws its elements, no editor. */
export const connectorViewerModule = defineModule({
  id: "connector",
  tier: "core",
  after: ["er"],
  register(host) {
    registerConnectorCanvas(host);
  },
});
