import { defineModule } from "@shared/core";
import { registerTableCanvas } from "./table.canvas";
import * as tableApi from ".";

/** The table module in the HTML viewer: what draws its elements, no editor. */
export const tableViewerModule = defineModule({
  id: "table",
  tier: "feature",
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...tableApi },
  register(host) {
    registerTableCanvas(host);
  },
});
