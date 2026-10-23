import { defineErStandard } from "./define-er-standard";

/** Elmasri & Navathe's EER (from secondary sources, not checked against the book yet). */
export const ELMASRI_STANDARD = defineErStandard({
  id: "elmasri",
  label: "Elmasri & Navathe",
  citation:
    "Ramez Elmasri, Shamkant B. Navathe, Fundamentals of Database Systems, 7th ed., Pearson.",
  url: "https://www.pearson.com/en-us/subject-catalog/p/fundamentals-of-database-systems/P200000003546",
  approximate: true,
  summary: "1 / N on the lines, double lines for total participation, the d / o circle.",
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
  supports: { hierarchies: true, aggregations: false, constraints: false, unions: true },
});
