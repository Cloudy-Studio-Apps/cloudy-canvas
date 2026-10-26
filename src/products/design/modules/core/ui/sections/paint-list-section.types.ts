import type { ReactNode } from "react";

import type { DesignNode } from "../../node/design-node.types";
import type { Paint } from "../../node/paint.types";

export interface PaintListSectionProps {
  title: string;
  /** The node field holding the paints. */
  field: "fills" | "strokes";
  nodes: readonly DesignNode[];
  /** The paint "+" adds. */
  newPaint: () => Paint;
  /** Whether its paints can be images (strokes, and fills of nodes that allow them). */
  allowImage: boolean;
  /** Shown under the paints (e.g. the stroke weight). */
  children?: ReactNode;
}
