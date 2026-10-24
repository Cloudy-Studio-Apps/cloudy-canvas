import { createElementBase } from "@canvas";

import { BROCHURE_TYPE } from "./brochure.constants";
import { BROCHURE_DEFAULTS } from "./brochure.defaults";
import type { BrochureElement } from "./brochure.types";

/** An empty brochure named `name` on the design page `page`, at `index` (only orders the list). */
export function createBrochure(index: string, page: string, name: string): BrochureElement {
  return {
    ...createElementBase(BROCHURE_TYPE, { x: 0, y: 0, w: 0, h: 0 }, index),
    name,
    page,
    slots: [],
    settings: { ...BROCHURE_DEFAULTS.settings },
  };
}
