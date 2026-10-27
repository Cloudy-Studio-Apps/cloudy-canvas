import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Identifying relations, drawn as double diamonds. */
export const IDENTIFYING_RELATIONS_CONSTRUCT = defineErConstruct({
  id: "identifying-relations",
  label: t("constructs.identifying-relations"),
  detect: (s) => s.relations.filter((r) => r.identifying).map((r) => r.id),
});
