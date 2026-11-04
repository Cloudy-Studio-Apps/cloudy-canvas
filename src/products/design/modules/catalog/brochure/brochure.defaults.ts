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
    colorMode: "rgb",
    printProfile: null,
    renderingIntent: "relative",
    dpi: 300,
    pdfMode: "sharp",
    arrange: "off",
    numbering: { start: 1, style: "arabic", covers: "hidden" },
    defaultMaster: null,
    mastersOnCovers: false,
    language: null,
  },
} satisfies BrochureDefaults;
