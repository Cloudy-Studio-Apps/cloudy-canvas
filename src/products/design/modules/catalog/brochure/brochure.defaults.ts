import type { BrochureDefaults } from "./brochure.types";

export const BROCHURE_DEFAULTS = {
  name: "Brochure",
  settings: {
    layout: "book",
    covers: "both",
    splitSpreads: true,
    margin: 12,
    dpi: 300,
    arrange: "off",
  },
} satisfies BrochureDefaults;
