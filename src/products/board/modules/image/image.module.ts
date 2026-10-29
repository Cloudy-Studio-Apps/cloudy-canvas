import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { ImageCrop } from "./ui/image-crop";
import { ImageOptions } from "./ui/image-options";
import * as imageApi from ".";
import { registerImageCanvas } from "./image.canvas";

/**
 * Pictures: the kind, pasting and dropping images, cropping them on the canvas (double-click) and
 * the panel of the selected ones.
 */
export const imageModule = defineModule({
  id: "image",
  tier: "core",
  exports: { ...imageApi },
  register(host) {
    registerImageCanvas(host);

    host.contribute(boardEditor.selectionPanels, { type: "image", component: ImageOptions });
    host.contribute(boardEditor.overlays, { id: "image.crop", component: ImageCrop });
  },
});
