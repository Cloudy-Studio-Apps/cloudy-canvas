import { DEFAULT_MODE, type Size } from "@canvas";
import { createPresetFrame, type FrameElement } from "../../frame";
import type { DesignEngine } from "../../../design-engine.types";
import type { DesignNode } from "../../core";
import { ensureBrochure } from "../model/current-brochure";
import { replaceImageFill } from "../../image";
import { chooseImageAsset } from "@canvas-ui";
import { t } from "../catalog.i18n";

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
 * last page of the page's open brochure (made when there's none), in one undo step, and shows
 * it.
 */
export function addBlankPage(engine: DesignEngine, size: Size, label: string): void {
  const preset = { id: "brochure-page", group: "Paper", label, size };
  const frame = createPresetFrame(preset, engine.doc, engine.elements());
  ensureBrochure(engine).addNewPage(frame);
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
  const assetId = await chooseImageAsset(engine, {
    title: t("images.replace.title"),
    errorTitle: t("images.replace.failed"),
  });
  if (!assetId) return;
  engine.doc.checkpoint();
  engine.doc.update(node.id, replaceImageFill(node, fill, assetId));
}
