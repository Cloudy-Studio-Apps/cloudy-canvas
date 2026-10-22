export interface DesignPanelState {
  /** The left panel's tab (a `leftTabs` id). */
  leftTab: string;
  /** The properties panel's tab. */
  propertiesTab: "design" | "prototype";
  setLeftTab: (tab: string) => void;
  setPropertiesTab: (tab: "design" | "prototype") => void;
}
