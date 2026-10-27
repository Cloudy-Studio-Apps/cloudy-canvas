import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Exclusive, inclusive, exclusion and inclusion constraints. */
export const CONSTRAINTS_CONSTRUCT = defineErConstruct({
  id: "constraints",
  label: t("constructs.constraints"),
  detect: (s) => s.constraints.map((x) => x.id),
});
