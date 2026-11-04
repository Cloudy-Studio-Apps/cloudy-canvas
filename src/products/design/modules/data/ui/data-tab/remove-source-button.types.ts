import type { DataSourceElement } from "../../source";

export interface RemoveSourceButtonProps {
  source: DataSourceElement;
  /** It was removed (the detail goes back to the list). */
  onRemoved: () => void;
}
