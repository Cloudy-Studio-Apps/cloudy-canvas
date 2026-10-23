import { defineErConstruct } from "./define-er-construct";

/** Associative entities: relations that are also entities. */
export const ASSOCIATIVE_ENTITIES_CONSTRUCT = defineErConstruct({
  id: "associative-entities",
  label: "Associative entities",
  detect: (s) => s.relations.filter((r) => r.associative).map((r) => r.id),
});
