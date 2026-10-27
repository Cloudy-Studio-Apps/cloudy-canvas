import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Optional attributes (half-filled lollipops). */
export const OPTIONAL_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "optional-attributes",
  label: t("constructs.optional-attributes"),
  detect: (s) => s.attributes.filter((a) => a.optional).map((a) => a.id),
});
