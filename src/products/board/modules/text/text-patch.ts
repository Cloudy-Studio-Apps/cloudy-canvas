import type { ElementPatch } from "@canvas";

import { TEXT_ALIGNS, TEXT_DEFAULTS } from "./text.defaults";
import type { TextElement } from "./text.types";

const WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const STYLES = ["normal", "italic"];

/** Throws, for agents, when a patch would give a label text or a font it can't have. */
export function checkTextPatch(patch: ElementPatch<TextElement>): void {
  if (patch.text !== undefined && !patch.text.trim()) {
    throw new Error("A text element needs some text; remove it with shapes_delete instead.");
  }
  const { minFontSize, maxFontSize } = TEXT_DEFAULTS;
  if (
    patch.fontSize !== undefined &&
    (patch.fontSize < minFontSize || patch.fontSize > maxFontSize)
  ) {
    throw new Error(`"fontSize" must be between ${minFontSize} and ${maxFontSize}.`);
  }
  if (patch.fontWeight !== undefined && !WEIGHTS.includes(String(patch.fontWeight))) {
    throw new Error(`"fontWeight" must be one of: ${WEIGHTS.join(", ")}.`);
  }
  if (patch.fontStyle !== undefined && !STYLES.includes(patch.fontStyle)) {
    throw new Error(`"fontStyle" must be one of: ${STYLES.join(", ")}.`);
  }
  if (patch.wrap !== undefined && typeof patch.wrap !== "boolean") {
    throw new Error('"wrap" must be true (fixed width, lines wrap) or false (sized to its text).');
  }
  if (patch.align !== undefined && !(TEXT_ALIGNS as readonly string[]).includes(patch.align)) {
    throw new Error(`"align" must be one of: ${TEXT_ALIGNS.join(", ")}.`);
  }
}
