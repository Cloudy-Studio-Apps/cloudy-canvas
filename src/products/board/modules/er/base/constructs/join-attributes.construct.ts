import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** The attribute a participant joins through (`Cliente.dni`). */
export const JOIN_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "join-attributes",
  label: t("constructs.join-attributes"),
  detect: (s) => s.relations.filter((r) => r.participants.some((p) => p.via)).map((r) => r.id),
});
