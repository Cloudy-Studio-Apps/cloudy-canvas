import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Derived attributes (dashed ellipses). */
export const DERIVED_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "derived-attributes",
  label: t("constructs.derived-attributes"),
  detect: (s) => s.attributes.filter((a) => a.derived).map((a) => a.id),
});
