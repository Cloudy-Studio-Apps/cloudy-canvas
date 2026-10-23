import { defineErConstruct } from "./define-er-construct";

/** Weak entities. */
export const WEAK_ENTITIES_CONSTRUCT = defineErConstruct({
  id: "weak-entities",
  label: "Weak entities",
  detect: (s) => s.entities.filter((e) => e.weak).map((e) => e.id),
});
