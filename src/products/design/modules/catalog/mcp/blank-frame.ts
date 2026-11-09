import { optionalBoolean, optionalChoice, type ToolArgs } from "@canvas";

import type { DesignWorkspace } from "../../../design-engine.types";
import { createPresetFrame, FRAME_PRESETS, findPreset, type FrameElement } from "../../frame";
import type { DesignBrochure } from "../model";

/** The paper presets a blank page can be (the frame presets' Paper group). */
export const PAPER_PRESETS = FRAME_PRESETS.filter((preset) => preset.group === "Paper").map(
  (preset) => preset.id,
);

/** A new empty page frame for `catalog_pages_add`: a paper preset, or the last page's size. */
export function blankFrame(
  engine: DesignWorkspace,
  brochure: DesignBrochure,
  blank: ToolArgs,
): FrameElement {
  if (engine.scope !== brochure.page) {
    throw new Error("Blank pages are added on your design page: pages_switch to the brochure's.");
  }
  const presetId = optionalChoice(blank, "preset", PAPER_PRESETS);
  const preset = presetId === undefined ? undefined : findPreset(presetId);
  const last = brochure.pages().at(-1)?.frame;
  const size = preset?.size ?? (last ? { w: last.w, h: last.h } : findPreset("a4")?.size);
  if (!size) throw new Error('Give "blank.preset".');
  const landscape = preset !== undefined && optionalBoolean(blank, "landscape") === true;
  const label = `${preset?.label ?? "Page"}${landscape ? " landscape" : ""}`;
  const shaped = landscape ? { w: Math.max(size.w, size.h), h: Math.min(size.w, size.h) } : size;
  const page = { id: "brochure-page", group: "Paper", label, size: shaped };
  return createPresetFrame(page, engine.doc, engine.elements());
}
