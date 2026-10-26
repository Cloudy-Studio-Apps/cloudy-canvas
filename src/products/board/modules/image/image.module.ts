import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { IMAGE_DEFAULTS } from "./image.defaults";
import { ImageKind } from "./image.kind";
import { createPastedImage } from "./pasted-image";
import { editImage } from "./image-crop";
import { ImageCrop } from "./ui/image-crop";
import { ImageOptions } from "./ui/image-options";

/**
 * Pictures: the kind, pasting and dropping images, cropping them on the canvas (double-click) and
 * the panel of the selected ones.
 */
export const imageModule = defineModule({
  id: "image",
  tier: "core",
  register(host) {
    host.contribute(boardCanvas.kinds, new ImageKind());
    host.contribute(boardCanvas.options, {
      imageBackground: IMAGE_DEFAULTS.background,
      imagePadding: IMAGE_DEFAULTS.padding,
    });
    host.contribute(boardCanvas.pasteImage, (image, view, index) =>
      createPastedImage(image, view, index),
    );

    host.contribute(boardCanvas.editElement, editImage);

    host.contribute(boardEditor.selectionPanels, { type: "image", component: ImageOptions });
    host.contribute(boardEditor.overlays, { id: "image.crop", component: ImageCrop });
  },
});
