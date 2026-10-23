import type { ErDiagramFields } from "./er.types";

/**
 * Diagram fields of an ER element that isn't written yet. `applyErPlan` stamps the real diagram on
 * every element it writes; elements from boards saved before diagrams existed load with these too and
 * are sorted into diagrams when the board opens (`migrateErDiagrams`).
 */
export const NO_ER_DIAGRAM: ErDiagramFields = { diagram: "", diagramName: "", notation: {} };
