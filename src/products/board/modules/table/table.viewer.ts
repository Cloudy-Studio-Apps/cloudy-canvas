import { defineModule } from "@shared/core";
import { registerTableCanvas } from "./table.canvas";

/** The table module in the HTML viewer: what draws its elements, no editor. */
export const tableViewerModule = defineModule({
  id: "table",
  tier: "feature",
  register(host) {
    registerTableCanvas(host);
  },
});
