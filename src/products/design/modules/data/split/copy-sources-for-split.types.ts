import type { CanvasDocument, CanvasElement } from "@canvas";

/** What `copySourcesForSplit` reads: the pages module's `PageSplitContext` fits it. */
export interface SplitSourcesInput {
  source: CanvasDocument;
  target: CanvasDocument;
  /** The split page's layers. */
  nodes: readonly CanvasElement[];
}
