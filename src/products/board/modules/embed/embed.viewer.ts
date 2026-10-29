import { defineModule } from "@shared/core";
import { registerEmbedCanvas } from "./embed.canvas";
import { boardViewerParts } from "../viewer/ui";
import { embedViewerPart } from "./ui/embed-viewer-part";
import * as embedApi from ".";

/** The embed module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const embedViewerModule = defineModule({
  id: "embed",
  tier: "feature",
  uses: ["viewer"],
  // Its engine API, for plugins that require it (its editor UI isn't in the viewer).
  exports: { ...embedApi },
  register(host) {
    registerEmbedCanvas(host);
    host.contribute(boardViewerParts, embedViewerPart);
  },
});
