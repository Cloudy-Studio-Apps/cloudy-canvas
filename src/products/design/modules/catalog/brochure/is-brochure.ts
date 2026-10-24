import type { CanvasElement } from "@canvas";

import { BROCHURE_TYPE } from "./brochure.constants";
import type { BrochureElement } from "./brochure.types";

export function isBrochure(el: CanvasElement): el is BrochureElement {
  return el.type === BROCHURE_TYPE;
}
