import { definePoint } from "@shared/core";

import type { PageSplitStep } from "./pages.points.types";

/** What modules and plugins copy into the new file when a page is split out (see `PageSplitStep`). */
export const pageSplitSteps = definePoint<PageSplitStep>("design.pageSplitSteps", {
  keyOf: (step) => step.id,
});
