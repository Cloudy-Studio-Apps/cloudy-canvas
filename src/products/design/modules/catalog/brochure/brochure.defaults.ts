import type { BrochureDefaults } from "./brochure.types";

export const BROCHURE_DEFAULTS = {
  name: "Brochure",
  settings: {
    layout: "book",
    covers: "both",
    splitSpreads: true,
    margin: 12,
    bleed: 3,
    cropMarks: true,
    dpi: 300,
    pdfMode: "sharp",
    arrange: "off",
  },
} satisfies BrochureDefaults;
