import type { ReactNode } from "react";

import type { DesignNode, Paint } from "@design";

export interface PaintListSectionProps {
  title: string;
  /** The node field holding the paints. */
  field: "fills" | "strokes";
  nodes: readonly DesignNode[];
  /** The paint "+" adds. */
  newPaint: () => Paint;
  /** Shown under the paints (e.g. the stroke weight). */
  children?: ReactNode;
}
