import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designMcpTools, designCanvas } from "../../design-points";
import { imageTools } from "./mcp";
import { createImageRectangle } from "./image-rectangle";
import { CropToolbarButton } from "./ui/crop-toolbar-button";
import { ImageCrop } from "./ui/image-crop";
import { isImageLayer } from "./ui/image-fill-index";
import { useCropImageCommand } from "./ui/use-crop-image-command";
import { useImagePlaceholderCommand } from "./ui/use-image-placeholder-command";
import { canHoldPlaceholder } from "./placeholder";
import { t } from "./image.i18n";
import * as imageApi from ".";

/**
 * Pasted and dropped images: each becomes a rectangle filled with it (the engine stores the file
 * as a document asset, in the same undo step). Image fills are edited in the paint picker and
 * cropped on the canvas (Crop image, or the picker's Crop). Use as image placeholder (and the
 * picker's Add placeholder) marks where a picture goes, for the Catalog to list until it's
 * replaced. Agents place picture files with `add_image` and placeholders with
 * `add_image_placeholder`.
 */
export const imageModule = defineModule({
  id: "image",
  tier: "feature",
  requires: ["rectangle"],
  exports: { ...imageApi },
  register(host) {
    host.contribute(designCanvas.pasteImage, (image, view, index) =>
      createImageRectangle(image, view, index),
    );
    host.contribute(
      designCanvas.hostCommands,
      { id: "cropImage", label: t("commands.crop") },
      { id: "imagePlaceholder", label: t("commands.placeholder") },
    );
    host.contribute(designMcpTools, { id: "image", tools: () => imageTools });

    host.contribute(
      designEditor.sessionHooks,
      { id: "crop-image", use: useCropImageCommand },
      { id: "image-placeholder", use: useImagePlaceholderCommand },
    );
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
          label: t("commands.crop"),
          enabled: (_context, engine) => {
            const [id, ...others] = engine.selectedIds();
            const node = id && others.length === 0 ? engine.getElement(id) : undefined;
            return node !== undefined && isImageLayer(node);
          },
        },
        {
          command: "imagePlaceholder",
          label: t("commands.placeholder"),
          enabled: (_context, engine) =>
            engine.selectedIds().some((id) => {
              const node = engine.getElement(id);
              return node !== undefined && canHoldPlaceholder(node, engine.kinds);
            }),
        },
      ],
    });
  },
});
