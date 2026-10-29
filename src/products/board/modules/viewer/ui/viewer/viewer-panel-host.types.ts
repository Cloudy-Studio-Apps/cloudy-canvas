import type { OpenPanel } from "./viewer-app.types";

export interface ViewerPanelHostProps {
  open: OpenPanel;
  /** What the part carries in the file. */
  data: unknown;
  onClose(): void;
}
