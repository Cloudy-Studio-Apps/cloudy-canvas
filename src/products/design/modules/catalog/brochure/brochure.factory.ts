import { createElementBase } from "@canvas";

import { BROCHURE_TYPE } from "./brochure.constants";
import { BROCHURE_DEFAULTS } from "./brochure.defaults";
import type { BrochureElement } from "./brochure.types";

/** An empty brochure record at `index` (its place in the document's order doesn't matter). */
export function createBrochure(index: string): BrochureElement {
  return {
    ...createElementBase(BROCHURE_TYPE, { x: 0, y: 0, w: 0, h: 0 }, index),
    slots: [],
    settings: { ...BROCHURE_DEFAULTS.settings },
  };
}
