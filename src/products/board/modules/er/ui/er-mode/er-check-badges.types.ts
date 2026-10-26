import type { ErIssueSeverity } from "../../model/check/check-er.types";

/** The findings about one shape, as its badge shows them. */
export interface ErShapeFindings {
  shapeId: string;
  /** The worst of them. */
  severity: ErIssueSeverity;
  messages: string[];
}
