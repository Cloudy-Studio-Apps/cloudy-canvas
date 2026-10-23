import { defineErConstruct } from "./define-er-construct";

/** Relations with three or more participants. */
export const NARY_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "nary-relations",
  label: "Relations of three or more sides",
  detect: (s) => s.relations.filter((r) => r.participants.length >= 3).map((r) => r.id),
});
