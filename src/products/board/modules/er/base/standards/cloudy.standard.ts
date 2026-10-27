import { defineErStandard } from "./define-er-standard";
import { t } from "../../er.i18n";

/** The board's own mix: what a diagram that names no standard follows. */
export const CLOUDY_STANDARD = defineErStandard({
  id: "cloudy",
  label: "Cloudy Canvas (default)",
  citation: t("standards.cloudyCitation"),
  url: null,
  approximate: false,
  summary: t("standards.cloudy"),
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
