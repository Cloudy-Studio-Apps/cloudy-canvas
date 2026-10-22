import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { IMAGE_DEFAULTS } from "./image.defaults";
import { ImageKind } from "./image.kind";
import { createPastedImage } from "./pasted-image";
import { ImageOptions } from "./ui/image-options";

/** Pictures: the kind, pasting and dropping images, and the panel of the selected ones. */
export const imageModule = defineModule({
  id: "image",
  register(host) {
    host.contribute(boardCanvas.kinds, new ImageKind());
    host.contribute(boardCanvas.options, {
      imageBackground: IMAGE_DEFAULTS.background,
      imagePadding: IMAGE_DEFAULTS.padding,
    });
    host.contribute(boardCanvas.pasteImage, (image, view, index) =>
      createPastedImage(image, view, index),
    );

    host.contribute(boardEditor.selectionPanels, { type: "image", component: ImageOptions });
  },
});
