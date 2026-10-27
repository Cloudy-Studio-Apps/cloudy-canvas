import { defineErStandard } from "./define-er-standard";
import { t } from "../../er.i18n";

/** Elmasri & Navathe's EER (from secondary sources, not checked against the book yet). */
export const ELMASRI_STANDARD = defineErStandard({
  id: "elmasri",
  label: "Elmasri & Navathe",
  citation:
    "Ramez Elmasri, Shamkant B. Navathe, Fundamentals of Database Systems, 7th ed., Pearson.",
  url: "https://www.pearson.com/en-us/subject-catalog/p/fundamentals-of-database-systems/P200000003546",
  approximate: true,
  summary: t("standards.elmasri"),
  settings: {
    cardinality: "ratio",
    ratio: "across",
    participation: "lines",
    isa: "circle",
    crowFeet: false,
    dependency: "marks",
    arrows: "manual",
    joins: "hidden",
  },
  forbids: [
    "aggregations",
    "constraints",
    "associative-entities",
    "dependency-marks",
    "join-attributes",
  ],
});
