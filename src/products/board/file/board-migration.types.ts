import type { CanvasDocument } from "@canvas";

/** Brings the document of an older board file up to date when it opens. */
export interface BoardMigration {
  id: string;
  /** Rewrites what's out of date. Not an undo step. */
  migrate(doc: CanvasDocument): void;
}
