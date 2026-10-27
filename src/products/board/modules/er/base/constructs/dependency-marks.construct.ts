import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** The identification (I) and existence (E) marks on relations. */
export const DEPENDENCY_MARKS_CONSTRUCT = defineErConstruct({
  id: "dependency-marks",
  label: t("constructs.dependency-marks"),
  detect: (s) => s.relations.filter((r) => r.idMark || r.existenceMark).map((r) => r.id),
});
