import type { MockFrame } from "./mock-data.types";

export interface PropertiesPanelProps {
  /** The selected frame, or `null` to show the page's properties. */
  frame: MockFrame | null;
}
