import { defineErStandard } from "./define-er-standard";
import { t } from "../../er.i18n";

/** Silberschatz, Korth & Sudarshan (from secondary sources, not checked against the book yet). */
export const SILBERSCHATZ_STANDARD = defineErStandard({
  id: "silberschatz",
  label: "Silberschatz, Korth & Sudarshan",
  citation:
    "Abraham Silberschatz, Henry F. Korth, S. Sudarshan, Database System Concepts, 7th ed., McGraw-Hill.",
  url: "https://db-book.com/",
  approximate: true,
  summary: t("standards.silberschatz"),
  settings: {
    cardinality: "minmax",
    ratio: "across",
    participation: "both",
    isa: "arrow",
    crowFeet: false,
    dependency: "marks",
    arrows: "cardinality",
    joins: "hidden",
  },
  forbids: ["constraints", "unions", "associative-entities", "dependency-marks", "join-attributes"],
});
