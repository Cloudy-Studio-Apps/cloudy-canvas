import { defineModule } from "@shared/core";
import { registerDbCanvas } from "./db.canvas";
import { boardViewerParts } from "../viewer/ui";
import { dbViewerPart } from "./ui/viewer/db-viewer-part";

/** The db module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const dbViewerModule = defineModule({
  id: "db",
  tier: "feature",
  requires: ["sticky"],
  uses: ["viewer"],
  register(host) {
    registerDbCanvas(host);
    host.contribute(boardViewerParts, dbViewerPart);
  },
});
