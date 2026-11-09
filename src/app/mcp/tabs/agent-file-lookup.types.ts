import type { AgentFileMatch } from "@canvas";

/** A file found by name: `id` is its storage id, `null` for a project file never opened before. */
export interface FileHit {
  id: string | null;
  match: AgentFileMatch;
}
