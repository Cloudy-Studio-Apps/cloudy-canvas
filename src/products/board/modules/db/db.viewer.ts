import { defineModule } from "@shared/core";
import { registerDbCanvas } from "./db.canvas";
import { boardViewerParts } from "../viewer/ui";
import { dbViewerPart } from "./ui/viewer/db-viewer-part";
import * as dbApi from ".";

/** The db module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const dbViewerModule = defineModule({
  id: "db",
  tier: "feature",
  requires: ["sticky"],
  uses: ["viewer"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...dbApi },
  register(host) {
    registerDbCanvas(host);
    host.contribute(boardViewerParts, dbViewerPart);
  },
});
