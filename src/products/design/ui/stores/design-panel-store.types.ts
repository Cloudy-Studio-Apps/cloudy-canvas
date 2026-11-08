export interface DesignPanelState {
  /** The left panel's tab (a `leftTabs` id). */
  leftTab: string;
  /** The properties panel's tab. */
  propertiesTab: "design" | "prototype";
  /** The Assets tab lists pictures as a grid of thumbnails or as rows. */
  assetsView: "grid" | "list";
  /** The left panel shows beside the rail (the rail's bottom button toggles it). */
  leftOpen: boolean;
  /** The properties panel shows (closed, a floating button over the canvas opens it). */
  rightOpen: boolean;
  setLeftTab: (tab: string) => void;
  setPropertiesTab: (tab: "design" | "prototype") => void;
  setAssetsView: (view: "grid" | "list") => void;
  setLeftOpen: (open: boolean) => void;
  setRightOpen: (open: boolean) => void;
}
