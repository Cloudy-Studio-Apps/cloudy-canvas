import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Weak entities. */
export const WEAK_ENTITIES_CONSTRUCT = defineErConstruct({
  id: "weak-entities",
  label: t("constructs.weak-entities"),
  detect: (s) => s.entities.filter((e) => e.weak).map((e) => e.id),
});
