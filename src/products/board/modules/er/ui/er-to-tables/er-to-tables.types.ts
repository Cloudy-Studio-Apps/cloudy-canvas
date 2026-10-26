import type { ErHierarchyStrategy } from "../../model/to-tables/to-tables.types";

export interface ErToTablesState {
  /** The diagram the dialog converts, or `null` while it's closed. */
  diagramId: string | null;
  open: (diagramId: string) => void;
  close: () => void;
}

export interface HierarchyChoiceProps {
  /** "Persona → Empleado, Socio". */
  label: string;
  value: ErHierarchyStrategy;
  onChange: (value: ErHierarchyStrategy) => void;
}

export interface StrategyPictureProps {
  strategy: ErHierarchyStrategy;
}

export interface ErToTablesBodyProps {
  diagramId: string;
  onDone: () => void;
}

export interface StrategyOption {
  value: ErHierarchyStrategy;
  label: string;
  hint: string;
}
