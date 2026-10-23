import { defineErConstruct } from "./define-er-construct";

/** The attribute a participant joins through (`Cliente.dni`). */
export const JOIN_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "join-attributes",
  label: "Join attributes",
  detect: (s) => s.relations.filter((r) => r.participants.some((p) => p.via)).map((r) => r.id),
});
