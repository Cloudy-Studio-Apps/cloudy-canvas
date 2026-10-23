import { defineErStandard } from "./define-er-standard";

/** Chen's original paper: the model before its extensions. */
export const CHEN_STANDARD = defineErStandard({
  id: "chen",
  label: "Chen (1976)",
  citation:
    "Peter P. Chen, “The Entity-Relationship Model: Toward a Unified View of Data”, ACM Transactions on Database Systems 1(1), 1976.",
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
    dependency: "marks",
    arrows: "manual",
    joins: "hidden",
  },
  forbids: [
    "hierarchies",
    "aggregations",
    "constraints",
    "unions",
    "associative-entities",
    "alternate-keys",
    "join-attributes",
  ],
});
