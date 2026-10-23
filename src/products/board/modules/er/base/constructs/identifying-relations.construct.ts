import { defineErConstruct } from "./define-er-construct";

/** Identifying relations, drawn as double diamonds. */
export const IDENTIFYING_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "identifying-relations",
  label: "Identifying relations (double diamonds)",
  detect: (s) => s.relations.filter((r) => r.identifying).map((r) => r.id),
});
