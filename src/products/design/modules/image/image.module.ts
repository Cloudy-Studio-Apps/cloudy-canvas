import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designAgentTools, designCanvas } from "../../design-points";
import { imageTools } from "./image.agent-tools";
import { createImageRectangle } from "./image-rectangle";
import { CropToolbarButton } from "./ui/crop-toolbar-button";
import { ImageCrop } from "./ui/image-crop";
import { isImageLayer } from "./ui/image-fill-index";
import { useCropImageCommand } from "./ui/use-crop-image-command";

/**
 * Pasted and dropped images: each becomes a rectangle filled with it (the engine stores the file
 * as a document asset, in the same undo step). Image fills are edited in the paint picker and
 * cropped on the canvas (Crop image, or the picker's Crop). Agents place picture files with
 * `add_image`.
 */
export const imageModule = defineModule({
  id: "image",
  requires: ["rectangle"],
  register(host) {
    host.contribute(designCanvas.pasteImage, (image, view, index) =>
      createImageRectangle(image, view, index),
    );
    host.contribute(designCanvas.hostCommands, { id: "cropImage", label: "Crop image" });
    host.contribute(designAgentTools, { id: "image", tools: () => imageTools });

    host.contribute(designEditor.sessionHooks, { id: "crop-image", use: useCropImageCommand });
    host.contribute(designEditor.overlays, { id: "image.crop", component: ImageCrop });
    host.contribute(designEditor.selectionActions, {
      id: "crop-image",
      order: 5,
      component: CropToolbarButton,
    });
    host.contribute(designEditor.contextMenu, {
      id: "image",
      menu: "selection",
      items: [
        {
          command: "cropImage",
          label: "Crop image",
          enabled: (_context, engine) => {
            const [id, ...others] = engine.selectedIds();
            const node = id && others.length === 0 ? engine.getElement(id) : undefined;
            return node !== undefined && isImageLayer(node);
          },
        },
      ],
    });
  },
});
