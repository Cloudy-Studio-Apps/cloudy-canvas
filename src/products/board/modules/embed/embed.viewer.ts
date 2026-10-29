import { defineModule } from "@shared/core";
import { registerEmbedCanvas } from "./embed.canvas";
import { boardViewerParts } from "../viewer/ui";
import { embedViewerPart } from "./ui/embed-viewer-part";

/** The embed module in the HTML viewer: what draws its elements and its viewer part, no editor. */
export const embedViewerModule = defineModule({
  id: "embed",
  tier: "feature",
  uses: ["viewer"],
  register(host) {
    registerEmbedCanvas(host);
    host.contribute(boardViewerParts, embedViewerPart);
  },
});
