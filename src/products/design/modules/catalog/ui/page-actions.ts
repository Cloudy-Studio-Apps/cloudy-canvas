import { DEFAULT_MODE, type Size } from "@canvas";
import {
  createPresetFrame,
  DESIGN_BROCHURE,
  type DesignEngine,
  type DesignNode,
  type FrameElement,
  replaceImageFill,
} from "@design";
import { pickImageFiles } from "@platform";
import { createId } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";

/** Shows a page frame on screen, switching design page when it's on another, and selects it. */
export function showPage(engine: DesignEngine, frame: FrameElement): void {
  if (engine.scope !== frame.pageId) engine.setScope(frame.pageId);
  engine.focusElement(frame.id);
}

/** Leaves the Catalog mode to design a page, zoomed in on it. */
export function editInDesign(engine: DesignEngine, frame: FrameElement): void {
  engine.setMode(DEFAULT_MODE.id);
  if (engine.scope !== frame.pageId) engine.setScope(frame.pageId);
  engine.zoomToElement(frame.id);
}

/**
 * Adds a blank frame of `size` (named `label` and numbered) right of the page's content, as the
 * brochure's last page, in one undo step, and shows it.
 */
export function addBlankPage(engine: DesignEngine, size: Size, label: string): void {
  const preset = { id: "brochure-page", group: "Paper", label, size };
  const frame = createPresetFrame(preset, engine.doc, engine.elements());
  engine.service(DESIGN_BROCHURE).addNewPage(frame);
  engine.focusElement(frame.id);
}

/**
 * Asks for a picture and puts it in a layer's image fill `fill` instead, keeping how the fill
 * places it (fit, crop, …), in one undo step.
 */
export async function replaceImage(
  engine: DesignEngine,
  node: DesignNode,
  fill: number,
): Promise<void> {
  try {
    const [file] = await pickImageFiles({ title: "Replace the image", multiple: false });
    if (!file) return;
    const assetId = createId();
    engine.doc.addAsset(assetId, file.data);
    engine.doc.checkpoint();
    engine.doc.update(node.id, replaceImageFill(node, fill, assetId));
  } catch (error) {
    notifyError("The image couldn't be replaced", error);
  }
}
