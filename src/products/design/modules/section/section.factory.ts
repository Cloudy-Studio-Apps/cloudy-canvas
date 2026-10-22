import type { Rect } from "@canvas";

import { createNodeBase, solidPaint } from "../core";
import { SECTION_DEFAULTS } from "./section.defaults";
import type { SectionElement } from "./section.types";

export function createSection(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): SectionElement {
  return createNodeBase("section", rect, index, {
    name,
    parentId,
    fills: [solidPaint(SECTION_DEFAULTS.fill)],
  });
}
