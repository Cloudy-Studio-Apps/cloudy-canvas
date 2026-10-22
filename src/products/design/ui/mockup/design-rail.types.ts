export type DesignRailTab = "layers" | "assets" | "plugins";

export interface DesignRailProps {
  tab: DesignRailTab;
  onTabChange: (tab: DesignRailTab) => void;
  onHome: () => void;
}
