import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Hierarchies (is-a). */
export const HIERARCHIES_CONSTRUCT = defineErConstruct({
  id: "hierarchies",
  label: t("constructs.hierarchies"),
  detect: (s) => s.isas.map((x) => x.id),
});
