import { defineErConstruct } from "./define-er-construct";

/** Aggregations: a relation boxed to take part as an entity. */
export const AGGREGATIONS_CONSTRUCT = defineErConstruct({
  id: "aggregations",
  label: "Aggregations",
  detect: (s) => s.aggregates.map((x) => x.id),
});
