import { defineModule } from "@shared/core";
import { designAgentTools, designCanvas } from "../../design-points";
import { imageTools } from "./image.agent-tools";
import { createImageRectangle } from "./image-rectangle";

/**
 * Pasted and dropped images: each becomes a rectangle filled with it (the engine stores the file
 * as a document asset, in the same undo step). Image fills are edited in the paint picker.
 * Agents place picture files with `add_image`.
 */
export const imageModule = defineModule({
  id: "image",
  requires: ["rectangle"],
  register(host) {
    host.contribute(designCanvas.pasteImage, (image, view, index) =>
      createImageRectangle(image, view, index),
    );
    host.contribute(designAgentTools, { id: "image", tools: () => imageTools });
  },
});
