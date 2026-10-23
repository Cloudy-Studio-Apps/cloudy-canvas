/** How much a finding matters: breaks the model, probably wrong, or worth knowing. */
export type ErIssueSeverity = "error" | "warning" | "info";

/** One finding of the Check diagram, about one shape. */
export interface ErIssue {
  /** Which rule found it (stable, for tools and tests). */
  rule: string;
  severity: ErIssueSeverity;
  message: string;
  /** The shape to select to fix it. */
  shapeId: string;
}
