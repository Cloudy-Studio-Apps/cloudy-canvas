import type { FileInfo } from "@shared/core";

/** A file open in the window that agents act on (a board, a design), given by the app. */
export interface AgentFile<Engine> {
  id: string;
  name: string;
  /** `null` until the file is saved for the first time. */
  path: string | null;
  dirty: boolean;
  /** Its services (`DB_SCHEMA`, `DESIGN_TREE`, …) are `engine.service(…)`. */
  engine: Engine;
  save(): Promise<void>;
}

/** A recent file as agents see it. */
export interface AgentRecentFile extends FileInfo {
  /** Moved or deleted since it was last seen. */
  missing: boolean;
}
