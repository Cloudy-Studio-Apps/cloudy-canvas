import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Recursive relations (an entity on both sides). */
export const SELF_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "self-relations",
  label: t("constructs.self-relations"),
  detect: (s) =>
    s.relations
      .filter((r) => new Set(r.participants.map((p) => p.entityId)).size < r.participants.length)
      .map((r) => r.id),
});
