import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Attributes owned by a relation. */
export const RELATION_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "relation-attributes",
  label: t("constructs.relation-attributes"),
  detect: (s) => {
    const relations = new Set(s.relations.map((r) => r.id));
    return s.attributes.filter((a) => relations.has(a.ownerId)).map((a) => a.id);
  },
});
