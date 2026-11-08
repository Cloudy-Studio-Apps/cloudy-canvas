import { defineModule } from "@shared/core";
import { registerModel3dCanvas } from "./model3d.canvas";
import * as model3dApi from ".";

/** The model module in the HTML viewer: it draws the saved picture, no editing. */
export const model3dViewerModule = defineModule({
  id: "model3d",
  tier: "feature",
  exports: { ...model3dApi },
  register(host) {
    registerModel3dCanvas(host);
  },
});
