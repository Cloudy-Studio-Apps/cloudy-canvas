import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Associative entities: relations that are also entities. */
export const ASSOCIATIVE_ENTITIES_CONSTRUCT = defineErConstruct({
  id: "associative-entities",
  label: t("constructs.associative-entities"),
  detect: (s) => s.relations.filter((r) => r.associative).map((r) => r.id),
});
