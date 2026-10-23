import { defineErStandard } from "./define-er-standard";

/** Silberschatz, Korth & Sudarshan (from secondary sources, not checked against the book yet). */
export const SILBERSCHATZ_STANDARD = defineErStandard({
  id: "silberschatz",
  label: "Silberschatz, Korth & Sudarshan",
  citation:
    "Abraham Silberschatz, Henry F. Korth, S. Sudarshan, Database System Concepts, 7th ed., McGraw-Hill.",
  url: "https://db-book.com/",
  approximate: true,
  summary: "Cardinality limits on the lines, double lines for total participation, aggregation.",
  settings: {
    cardinality: "minmax",
    ratio: "across",
    participation: "both",
    isa: "arrow",
    crowFeet: false,
    dependency: "marks",
    arrows: "cardinality",
  },
  supports: { hierarchies: true, aggregations: true, constraints: false, unions: false },
});
