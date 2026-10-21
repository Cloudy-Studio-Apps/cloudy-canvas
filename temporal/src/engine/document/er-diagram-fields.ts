import type { ErDiagramFields } from "./shapes.types";

/**
 * Diagram fields of an ER shape that isn't written yet. `applyErPlan` stamps the real diagram on
 * every shape it writes; shapes from boards saved before diagrams existed load with these too and
 * are sorted into diagrams when the board opens (`migrateErDiagrams`).
 */
export const NO_ER_DIAGRAM: ErDiagramFields = { diagram: "", diagramName: "" };
