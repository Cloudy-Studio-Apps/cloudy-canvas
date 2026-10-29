import { defineModule } from "@shared/core";
import { registerErCanvas } from "./er.canvas";
import { boardViewerParts } from "../viewer/ui";
import { erViewerPart } from "./ui/viewer/er-viewer-part";
import * as erApi from ".";

/** The er module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const erViewerModule = defineModule({
  id: "er",
  tier: "feature",
  uses: ["db", "geo", "viewer"],
  after: ["section"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...erApi },
  register(host) {
    registerErCanvas(host);
    host.contribute(boardViewerParts, erViewerPart);
  },
});
