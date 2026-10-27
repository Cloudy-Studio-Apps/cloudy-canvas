import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Multivalued attributes (double ellipses). */
export const MULTIVALUED_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "multivalued-attributes",
  label: t("constructs.multivalued-attributes"),
  detect: (s) => s.attributes.filter((a) => a.multivalued).map((a) => a.id),
});
