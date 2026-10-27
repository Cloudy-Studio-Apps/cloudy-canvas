import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Relations with three or more participants. */
export const NARY_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "nary-relations",
  label: t("constructs.nary-relations"),
  detect: (s) => s.relations.filter((r) => r.participants.length >= 3).map((r) => r.id),
});
