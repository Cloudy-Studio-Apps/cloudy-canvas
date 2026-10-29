import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { IMAGE_DEFAULTS } from "./image.defaults";
import { ImageKind } from "./image.kind";
import { createPastedImage } from "./pasted-image";
import { editImage } from "./image-crop";

/** The image module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerImageCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new ImageKind());
  host.contribute(boardCanvas.options, {
    imageBackground: IMAGE_DEFAULTS.background,
    imagePadding: IMAGE_DEFAULTS.padding,
  });
  host.contribute(boardCanvas.pasteImage, (image, view, index) =>
    createPastedImage(image, view, index),
  );
  host.contribute(boardCanvas.editElement, editImage);
}
