import type { DataIssue } from "../../checks";

export interface SourceIssuesProps {
  /** The issues tied to this source. */
  issues: readonly DataIssue[];
}
