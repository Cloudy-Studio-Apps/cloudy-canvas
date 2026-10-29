import { defineModule } from "@shared/core";
import { registerConnectorCanvas } from "./connector.canvas";
import * as connectorApi from ".";

/** The connector module in the HTML viewer: what draws its elements, no editor. */
export const connectorViewerModule = defineModule({
  id: "connector",
  tier: "core",
  after: ["er"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...connectorApi },
  register(host) {
    registerConnectorCanvas(host);
  },
});
