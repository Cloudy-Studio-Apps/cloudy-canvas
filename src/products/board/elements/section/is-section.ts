import type { CanvasElement } from "@canvas";

import type { SectionElement } from "./section.types";

export function isSection(el: CanvasElement | undefined): el is SectionElement {
  return el?.type === "section";
}
