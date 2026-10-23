import type { DesignNode } from "@design";

export interface StrokeSettingsProps {
  nodes: readonly DesignNode[];
  /** Whether a selected node has open ends (caps matter without dashes too). */
  openEnds: boolean;
}
