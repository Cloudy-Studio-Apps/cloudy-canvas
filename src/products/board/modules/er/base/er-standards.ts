import type { ErStandard, ErStandardInfo } from "./er.types";

const ALL = { hierarchies: true, aggregations: true, constraints: true };

/**
 * The standards a diagram can follow. Settings other than `cloudy`'s come from the research in
 * `docs/er-roadmap.md` (secondary sources, hence `approximate`); a diagram can still override any.
 */
export const ER_STANDARDS: Readonly<Record<ErStandard, ErStandardInfo>> = {
  cloudy: {
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
    },
    supports: ALL,
  },
  chen: {
    id: "chen",
    label: "Chen (1976)",
    citation:
      "Peter P. Chen, \u201cThe Entity-Relationship Model: Toward a Unified View of Data\u201d, ACM Transactions on Database Systems 1(1), 1976.",
    url: "https://www.comp.nus.edu.sg/~lingtw/papers/tods76.chen.pdf",
    approximate: false,
    summary:
      "The original model: 1, N and M on the lines; no hierarchies, aggregations or constraints.",
    settings: {
      cardinality: "ratio",
      ratio: "across",
      participation: "numbers",
      isa: "arc",
      crowFeet: false,
    },
    supports: { hierarchies: false, aggregations: false, constraints: false },
  },
  elmasri: {
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
    },
    supports: { hierarchies: true, aggregations: false, constraints: false },
  },
  silberschatz: {
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
      isa: "arc",
      crowFeet: false,
    },
    supports: { hierarchies: true, aggregations: true, constraints: false },
  },
  piattini: {
    id: "piattini",
    label: "de Miguel, Piattini & Marcos",
    citation:
      "Adoraci\u00f3n de Miguel, Mario Piattini, Esperanza Marcos, Dise\u00f1o de bases de datos relacionales, Alfaomega / Ra-Ma.",
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
    },
    supports: ALL,
  },
};

/** The standards, in the order the selector lists them. */
export const ER_STANDARD_LIST: readonly ErStandardInfo[] = Object.values(ER_STANDARDS);
