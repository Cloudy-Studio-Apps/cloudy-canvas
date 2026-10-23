import { defineErConstruct } from "./define-er-construct";

/** Exclusive, inclusive, exclusion and inclusion constraints. */
export const CONSTRAINTS_CONSTRUCT = defineErConstruct({
  id: "constraints",
  label: "Constraints between relations",
  detect: (s) => s.constraints.map((x) => x.id),
});
