import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Attributes made of parts. */
export const COMPOSITE_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "composite-attributes",
  label: t("constructs.composite-attributes"),
  detect: (s) => {
    const owners = new Set(s.attributes.map((a) => a.ownerId));
    return s.attributes.filter((a) => owners.has(a.id)).map((a) => a.id);
  },
});
