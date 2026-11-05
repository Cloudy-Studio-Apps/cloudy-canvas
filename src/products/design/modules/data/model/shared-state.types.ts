import type { DataContext } from "../update";
import type { SourceUpdates } from "./source-updates";

/**
 * What every view of one document shares: an agent's workspace has its own service on a proxy of
 * the same Yjs doc, and must see the editor's context and the Updates it runs.
 */
export interface SharedState {
  context: DataContext | null;
  updates: SourceUpdates;
  /** What repeats make: a few copies while designing, every row in an export (`dataPhase`). */
  phase: DataPhase;
}

/** `"design"`: repeats make their design caps' copies; `"export"`: every row. */
export type DataPhase = "design" | "export";
