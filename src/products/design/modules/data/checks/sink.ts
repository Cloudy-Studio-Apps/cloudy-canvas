import type { DataIssue, DataIssues } from "./data-issues.types";

/** Most issues one call collects. */
export const MAX_ISSUES = 500;

/** Collects issues up to `MAX_ISSUES`; `full()` says to stop looking. */
export class IssueSink {
  readonly issues: DataIssue[] = [];
  truncated = false;

  add(issue: DataIssue): void {
    if (this.issues.length >= MAX_ISSUES) this.truncated = true;
    else this.issues.push(issue);
  }

  full(): boolean {
    return this.truncated || this.issues.length >= MAX_ISSUES;
  }

  result(): DataIssues {
    return { issues: this.issues, truncated: this.truncated };
  }
}
