import { LINE_HEIGHT, SECTION_FONT_SIZE, SECTION_TITLE_H, type SectionShape } from "../document";
import type { Point, Rect } from "../geometry.types";
import { measureText } from "../text/text-metrics";

/** Room right of the title text that still counts as the title. */
const TITLE_PAD = 8;

/** Where the title text starts (world), vertically centered in the strip above the section. */
export function sectionTitleOrigin(section: SectionShape): Point {
  const lineHeight = SECTION_FONT_SIZE * LINE_HEIGHT;
  return { x: section.x, y: section.y - SECTION_TITLE_H + (SECTION_TITLE_H - lineHeight) / 2 };
}

/** The clickable title strip above the section's top-left corner. */
export function sectionTitleRect(section: SectionShape): Rect {
  const width = measureText(section.text || " ", SECTION_FONT_SIZE).w * 1.08 + TITLE_PAD;
  return {
    x: section.x,
    y: section.y - SECTION_TITLE_H,
    w: Math.min(section.w, width),
    h: SECTION_TITLE_H,
  };
}
