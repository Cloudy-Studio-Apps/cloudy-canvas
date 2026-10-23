import { defineErConstruct } from "./define-er-construct";

/** The identification (I) and existence (E) marks on relations. */
export const DEPENDENCY_MARKS_CONSTRUCT = defineErConstruct({
  id: "dependency-marks",
  label: "Dependency marks (I, E)",
  detect: (s) => s.relations.filter((r) => r.idMark || r.existenceMark).map((r) => r.id),
});
