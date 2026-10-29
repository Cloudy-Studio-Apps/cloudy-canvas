import type { CodeTargetDefinition } from "../targets";

export interface CodeExportBodyProps {
  /** The ids the dialog opened with (`[]`: the whole schema). */
  ids: string[];
  /** The installed targets (never empty). */
  targets: readonly CodeTargetDefinition[];
  onDone: () => void;
}

/** One table (its model) or the framework's whole structure. */
export type CodeExportScope = "table" | "schema";
