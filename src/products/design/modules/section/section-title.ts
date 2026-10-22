import { measureText, type Rect } from "@canvas";

import { SECTION_DEFAULTS } from "./section.defaults";
import type { SectionElement } from "./section.types";

/** The name pill, relative to the section's top-left corner (as wide as the name, up to it). */
export function sectionTitleBox(el: SectionElement, name: string): Rect {
  const { fontSize, padX, padY, inset } = SECTION_DEFAULTS.title;
  const text = measureText(name, fontSize);
  const w = Math.min(Math.max(0, el.w - inset * 2), text.w + padX * 2);
  return { x: inset, y: inset, w, h: text.h + padY * 2 };
}
