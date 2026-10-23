import { defineErStandard } from "./define-er-standard";

/** The board's own mix: what a diagram that names no standard follows. */
export const CLOUDY_STANDARD = defineErStandard({
  id: "cloudy",
  label: "Cloudy Canvas (default)",
  citation: "The board's own mix of the common notations.",
  url: null,
  approximate: false,
  summary:
    "(min,max) on the lines, the ratio on the diamond, triangle hierarchies and crow's feet.",
  settings: {
    cardinality: "minmax",
    ratio: "across",
    participation: "numbers",
    isa: "arc",
    crowFeet: true,
    dependency: "marks",
    arrows: "manual",
    joins: "shown",
  },
});
