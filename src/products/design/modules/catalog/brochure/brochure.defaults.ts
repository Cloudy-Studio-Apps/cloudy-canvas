import type { BrochureDefaults } from "./brochure.types";

export const BROCHURE_DEFAULTS = {
  settings: { layout: "book", covers: "both", splitSpreads: true, margin: 12, dpi: 300 },
} satisfies BrochureDefaults;
