import type { DataIssue, DataIssueKind } from "../../checks";
import { t } from "../../data.i18n";

const KEYS = {
  "unresolved-token": "unresolvedToken",
  "image-failed": "imageFailed",
  "text-overflow": "textOverflow",
  "detached-row-gone": "detachedRowGone",
  "source-error": "sourceError",
  "never-updated": "neverUpdated",
  "too-many-copies": "tooManyCopies",
  "copies-stacked": "copiesStacked",
} as const satisfies Record<DataIssueKind, string>;

/** An issue in words; its English `detail` only fills the translated line. */
export function issueText(issue: DataIssue): string {
  return t(`issues.kind.${KEYS[issue.kind]}`, { detail: issue.detail });
}
