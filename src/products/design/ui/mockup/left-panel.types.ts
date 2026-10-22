import type { DesignRailTab } from "./design-rail.types";

export interface LeftPanelProps extends LayersTabProps {
  tab: DesignRailTab;
  fileName: string;
}

export interface LayersTabProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}
