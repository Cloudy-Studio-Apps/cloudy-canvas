import { defineModule } from "@shared/core";
import { registerErCanvas } from "./er.canvas";
import { boardViewerParts } from "../viewer/ui";
import { erViewerPart } from "./ui/viewer/er-viewer-part";

/** The er module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const erViewerModule = defineModule({
  id: "er",
  tier: "feature",
  uses: ["db", "geo", "viewer"],
  after: ["section"],
  register(host) {
    registerErCanvas(host);
    host.contribute(boardViewerParts, erViewerPart);
  },
});
