import type { CanvasDocument } from "@canvas";

/** Brings an older design's document up to date when it opens (not an undo step). */
export interface DesignMigration {
  id: string;
  migrate(doc: CanvasDocument): void;
}
