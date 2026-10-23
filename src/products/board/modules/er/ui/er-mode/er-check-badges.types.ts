import type { ErIssueSeverity } from "@board";

/** The findings about one shape, as its badge shows them. */
export interface ErShapeFindings {
  shapeId: string;
  /** The worst of them. */
  severity: ErIssueSeverity;
  messages: string[];
}
