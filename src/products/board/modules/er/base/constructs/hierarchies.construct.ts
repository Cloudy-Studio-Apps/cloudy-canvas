import { defineErConstruct } from "./define-er-construct";

/** Hierarchies (is-a). */
export const HIERARCHIES_CONSTRUCT = defineErConstruct({
  id: "hierarchies",
  label: "Hierarchies",
  detect: (s) => s.isas.map((x) => x.id),
});
