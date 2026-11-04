import type { ElementKinds } from "@canvas";

import type { DesignDataSources } from "../model";

export type DataIssueKind =
  | "unresolved-token"
  | "image-failed"
  | "text-overflow"
  | "detached-row-gone"
  | "source-error"
  | "never-updated"
  | "too-many-copies"
  | "copies-stacked";

/** One piece of data that doesn't fit. `detail` is English (parameters for the translated line). */
export interface DataIssue {
  kind: DataIssueKind;
  /** The layer it is on (a bound layer, or an iterator). */
  nodeId?: string;
  /** The source it comes from, when known (a token is tied to its root name in scope). */
  sourceId?: string;
  detail: string;
}

export interface DataIssueOptions {
  /** Limits the layer checks to these ids (a subtree's); source checks are then left out. */
  nodes?: string[];
  /** The service, for the in-memory Update errors and picture failures of this device. */
  sources?: DesignDataSources;
  /** The design's kinds, needed to resolve bound layers (`unresolved-token`, `text-overflow`). */
  kinds?: ElementKinds;
}

export interface DataIssues {
  issues: DataIssue[];
  /** More than `MAX_ISSUES` were found; the rest weren't collected. */
  truncated: boolean;
}
