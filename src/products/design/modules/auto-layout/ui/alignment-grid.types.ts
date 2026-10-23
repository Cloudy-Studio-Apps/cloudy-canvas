import type { AutoLayout } from "@design";

export interface AlignmentGridProps {
  /** The frames' shared layout (the first one's when they differ). */
  layout: AutoLayout;
  onPick: (change: Pick<AutoLayout, "align" | "counterAlign">) => void;
}
