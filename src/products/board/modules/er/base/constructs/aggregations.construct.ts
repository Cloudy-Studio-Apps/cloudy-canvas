import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Aggregations: a relation boxed to take part as an entity. */
export const AGGREGATIONS_CONSTRUCT = defineErConstruct({
  id: "aggregations",
  label: t("constructs.aggregations"),
  detect: (s) => s.aggregates.map((x) => x.id),
});
