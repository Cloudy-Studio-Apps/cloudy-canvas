import { measureText, type Rect } from "@canvas";

import { SECTION_DEFAULTS } from "./section.defaults";
import type { SectionElement } from "./section.types";

/** The clickable title strip at the section's top-left corner (as wide as the title). */
export function sectionTitleRect(el: SectionElement): Rect {
  const { fontSize, titleHeight, titlePadding } = SECTION_DEFAULTS;
  const width = measureText(el.text || " ", fontSize).w * 1.08 + titlePadding * 2;
  return { x: el.x, y: el.y, w: Math.min(el.w, width), h: titleHeight };
}
