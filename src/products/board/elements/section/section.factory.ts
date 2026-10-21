import { createElementBase, type Rect, roundRect } from "@canvas";

import type { SectionElement } from "./section.types";

export function createSection(
  rect: Rect,
  title: string,
  color: string,
  index: string,
): SectionElement {
  return { ...createElementBase("section", roundRect(rect), index), text: title, color };
}
