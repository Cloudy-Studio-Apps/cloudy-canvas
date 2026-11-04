import { DEFAULT_MODE, type Size } from "@canvas";
import { createPresetFrame, type FrameElement } from "../../frame";
import type { DesignEngine } from "../../../design-engine.types";
import type { DesignNode } from "../../core";
import { createId } from "@shared/core";
import type { BrochureSection } from "../brochure";
import type { DesignBrochure } from "../model/design-brochure";
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
 * Adds a blank frame of `size` (named `label` and numbered) right of the page's content, as a
 * page of the page's open brochure (made when there's none) at `at` (default: the end), in one
 * undo step, and shows it.
 */
export function addBlankPage(engine: DesignEngine, size: Size, label: string, at?: number): void {
  const frame = blankFrame(engine, size, label);
  ensureBrochure(engine).addNewPage(frame, at);
  engine.focusElement(frame.id);
}

/**
 * Adds a blank page as `addBlankPage` does that starts a new section ("Section 4"), in one undo
 * step, and shows it.
 */
export function addSectionPage(engine: DesignEngine, size: Size, label: string, at?: number): void {
  const frame = blankFrame(engine, size, label);
  const brochure = ensureBrochure(engine);
  brochure.addNewSection(frame, nextSectionName(brochure.masters.sections()), at);
  engine.focusElement(frame.id);
}

/** Starts a section at page `slotId` ("Section 4"), or ends the one starting there. */
export function toggleSection(brochure: DesignBrochure, slotId: string): void {
  const sections = brochure.masters.sections();
  if (sections.some((section) => section.start === slotId)) {
    brochure.masters.setSections(sections.filter((section) => section.start !== slotId));
    return;
  }
  const section = { id: createId(), name: nextSectionName(sections), start: slotId };
  brochure.masters.setSections([...sections, section]);
}

/** What a new section is called before it's renamed. */
export function nextSectionName(sections: readonly BrochureSection[]): string {
  return t("section.defaultName", { n: sections.length + 1 });
}

function blankFrame(engine: DesignEngine, size: Size, label: string): FrameElement {
  const preset = { id: "brochure-page", group: "Paper", label, size };
  return createPresetFrame(preset, engine.doc, engine.elements());
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
