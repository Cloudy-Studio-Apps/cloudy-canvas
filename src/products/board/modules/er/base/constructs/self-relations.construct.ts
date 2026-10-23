import { defineErConstruct } from "./define-er-construct";

/** Recursive relations (an entity on both sides). */
export const SELF_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "self-relations",
  label: "Relations of an entity with itself",
  detect: (s) =>
    s.relations
      .filter((r) => new Set(r.participants.map((p) => p.entityId)).size < r.participants.length)
      .map((r) => r.id),
});
