import { defineErStandard } from "./define-er-standard";

/** de Miguel, Piattini & Marcos, the Spanish textbook (from secondary sources, not checked yet). */
export const PIATTINI_STANDARD = defineErStandard({
  id: "piattini",
  label: "de Miguel, Piattini & Marcos",
  citation:
    "Adoración de Miguel, Mario Piattini, Esperanza Marcos, Diseño de bases de datos relacionales, Alfaomega / Ra-Ma.",
  url: "https://biblioteca.cun.edu.co/bib/4716",
  approximate: true,
  summary:
    "(min,max) on the lines, the ratio on the diamond, triangle hierarchies, aggregation and constraints.",
  settings: {
    cardinality: "minmax",
    ratio: "across",
    participation: "numbers",
    isa: "arc",
    crowFeet: false,
    dependency: "marks",
    arrows: "manual",
    joins: "hidden",
  },
  forbids: ["unions", "associative-entities", "join-attributes"],
});
