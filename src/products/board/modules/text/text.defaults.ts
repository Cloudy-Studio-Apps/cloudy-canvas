import type { TextDefaults } from "./text.types";

/** Text label typography, in world units. */
export const TEXT_DEFAULTS = {
  fontSize: 20,
  minFontSize: 8,
  maxFontSize: 400,
  colorOptions: { color: "textColor" },
} as const satisfies TextDefaults;

/** The weight bold text is drawn in. */
export const TEXT_BOLD_WEIGHT = "700";

/** The alignments a label can take. */
export const TEXT_ALIGNS = ["left", "center", "right"] as const;
